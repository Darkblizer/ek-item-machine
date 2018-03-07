/** @module main */
const ItemMachine = require("./bot.js");
const DropboxSync = require("./dropbox-sync.js");
const EnvVars = require("./env-vars.js");
const TextReader = require("./text-reader.js");
const _ = require("lodash");
const fs = require("fs-extra");
/** Create the bot, and log into the server */
/*
let im = new ItemMachine();
im.login(EnvVars.discordToken);
*/
let dbx = new DropboxSync(EnvVars.dropboxToken);
fs.remove("./res");
dbx.downloadAll("/EKMachineTest", "./res")
    .then((result) => {
        console.log("Files downloaded!");
        dbx.updateOnChange("/EKMachineTest", "./res", (files) => {
            console.log("Files changed!"); 
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
                console.log(type + " " + file.path_lower);
            });
        });
        console.log("Now awaiting changes...");
    })
    .catch((err) => {
        console.log(err);
    });