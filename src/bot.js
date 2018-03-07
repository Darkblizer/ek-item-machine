/** @module bot */
const Discord = require("discord.js");
const fs = require("fs-extra");
const _ = require("lodash");
const TextReader = require("./text-reader.js");

/** The entire bot, knows how to log in and respond to things all by itself */
module.exports = class Bot {
    /**
        Initializes the bot, creating the client and preparing
        necessary callbacks
        @constructor
    */
    constructor() {
        this.client = new Discord.Client();
        this.loadCommands()
            .then(() => {
                this.setupCallbacks();
            })
            .catch((err) => {
                console.log(err);
            });
        this.lastUpdate = new Date(Date.now());
    }
    
    /**
        Reads the commands.json from the res folder and puts it into a property
        @returns {Promise} A promise which resolves when the json is read
    */
    loadCommands() {
        return fs.readJSON("./res/commands.json")
            .then((json) => {
                this.commands = json;
            });
    }
    
    /**
        Sets up all of the necessary callbacks for the bot
        @return {undefined}
    */
    setupCallbacks() {
        this.client.on("disconnect", (ev) => {
            this.onDisconnect(ev);
        });
        this.client.on("message", (msg) => {
            this.onMessage(msg);
        });
    }
    
    /**
        Logs the bot into Discord using the provided token.
        On successful login, goes to onConnect.
        On failure, outputs an error message.
        @param {string} tkn The Discord login token
        @returns {Promise<string>} The resulting promise, with the login token
    */
    login(tkn) {
        return this.client.login(tkn)
            .then(() => {
                this.onConnect();
            })
            .catch((err) => {
                this.log(err);
            });
    }
    
    /**
        Called when the bot logs into the server.
        Currently only outputs a message to the console to confirm
        it connected.
        @returns {undefined}
    */
    onConnect() {
        this.log("Connected.");
    }
    
    /**
        Called when the bot is disconnected from the server.
        Outputs that the bot disconnected, and the reason for disconnecting.
        @param {CloseEvent} ev The closing event emitted from the disconnect.
        @returns {undefined}
    */
    onDisconnect(ev) {
        this.log("Disconnected (" + ev.reason + ")");
    }

    /**
        Called when the bot's dropbox is updated.
        @param {Array} files The files which were changed
        @returns {undefined}
    */
    onUpdate(files) {
        this.log("Resource folder updated!");
        this.log("Changes: ");
        _.each(files, (file) => {
            let type = "UNKNOWN_OPERATION";
            switch(file[".tag"]) {
            case "file":
                type = "WROTE";
                break;
            case "folder":
                type = "CREATED";
                break;
            case "deleted":
                type = "DELETED";
                break;
            }
            this.log(type + " " + file.path_lower);
        });
        
        // We also need to update the JSON
        this.loadCommands();
        
        this.lastUpdate = new Date(Date.now());
    }
    
    /**
        Called when the bot receives a message anywhere.
        @param {Message} msg The message sent 
        @returns {undefined}
    */
    onMessage(msg) {
        let cmd = msg.content.replace(/(^.*?) /, (match, p1) => {
            return "/" + p1;
        });
        
        // Hard-coded commands with special behaviour
        if (cmd == "!lastupdate") {
            this.reportLastUpdate(cmd, msg);
        }
        else if (cmd == "!ping") {
            this.pong(cmd, msg);
        }
        if (_.has(this.commands, cmd)) {
            this.runCommand(cmd, msg);
        }
    }
    
    /**
        Runs a particular command from the list of commands.
        @param {string} cmd The command which was called
        @param {Message} msg The message which activated the command
        @returns {undefined}
        
    */
    runCommand(cmd, msg) {
        TextReader.readRandom("./res/" + this.commands[cmd].file)
            .then((line) => {
                let output = this.commands[cmd].message
                    .replace("$l", line.replace("\n", ""))
                    .replace("$n", "<@" + msg.author.id + ">");
                return msg.channel.send(output);
            })
            .catch((err) => {
                this.log(err);
            });
    }        
    
    /**
        Reports the time the last update to the dropbox occurred
        @param {string} cmd The command which was called
        @param {Message} msg The message which activated the command
        @returns {undefined}
        
    */
    reportLastUpdate(cmd, msg) {
        msg.channel.send("Last resource update: " + this.lastUpdate.toUTCString())
            .catch((err) => {
                this.log(err);
            });
    } 
    
    /**
        Replies to a ping event, in style!
        @param {string} cmd The command which was called
        @param {Message} msg The message which activated the command
        @returns {undefined}
        
    */
    pong(cmd, msg) {
        msg.react("👌")
            .catch((err) => {
                this.log(err);
            });
    } 
    
    /**
        Outputs a message to the console.
        @param {string} msg The text to print to the console.
        @returns {void}
    */
    log(msg) {
        console.log(msg);
    }
};