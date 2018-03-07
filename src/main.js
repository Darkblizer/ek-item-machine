/** @module main */
const ItemMachine = require("./bot.js");
const DropboxSync = require("./dropbox-sync.js");
const EnvVars = require("./env-vars.js");
const TextReader = require("./text-reader.js");
const _ = require("lodash");
const fs = require("fs-extra");

let dbx = new DropboxSync(EnvVars.dropboxToken);
fs.remove("./res");
dbx.downloadAll("/EKMachineTest", "./res")
    .then((result) => {
        console.log("Files downloaded!");
        
        // Create the bot
        let im = new ItemMachine();

        // Start the update loop for getting files from dropbox on change
        dbx.updateOnChange("/EKMachineTest", "./res", (files) => {
            im.onUpdate(files);
        });
        
        // Start the bot
        im.login(EnvVars.discordToken);

    })
    .catch((err) => {
        console.log(err);
    });