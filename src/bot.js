/** @module bot */
const Discord = require("discord.js");

/** The entire bot, knows how to log in and respond to things all by itself */
module.exports = class Bot {
    /**
        Initializes the bot, creating the client and preparing
        necessary callbacks
        @constructor
    */
    constructor() {
        this.client = new Discord.Client();
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
        @param {string} tkn - The Discord login token
        @returns {Promise<string>} The resulting promise, with the login token
    */
    login(tkn) {
        return this.client.login(tkn)
            .then(() => {
                this.onConnect();
            })
            .catch((err) => {
                this.log("Login error: " + err);
            });
    }
    
    /**
        Called when the bot logs into the server.
        Currently only outputs a message to the console to confirm
        it connected.
        @returns {void}
    */
    onConnect() {
        this.log("Connected.");
    }
    
    /**
        Called when the bot is disconnected from the server.
        Outputs that the bot disconnected, and the reason for disconnecting.
        @param {CloseEvent} ev The closing event emitted from the disconnect.
        @returns {void}
    */
    onDisconnect(ev) {
        this.log("Disconnected (" + ev.reason + ")");
    }
    
    /**
        Called when the bot receives a message anywhere.
        Currently only outputs the message to the console.
        @param {Message} msg The message sent 
        @returns {void}
    */
    onMessage(msg) {
        this.log("Message received: " + msg);
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