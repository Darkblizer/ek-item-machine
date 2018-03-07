/** @module main */
const ItemMachine = require("./bot.js");
const DropboxSync = require("./dropbox-sync.js");
const EnvVars = require("./env-vars.js");
const TextReader = require("./text-reader.js");
const _ = require("lodash");
const fs = require("fs-extra");

let folder = EnvVars.dropboxFolder;
if (folder.substring(0, 1) != "/") {
    folder = "/" + folder;
}

console.log(folder);

let dbx = new DropboxSync(EnvVars.dropboxToken);

fs.remove("./res");

dbx.downloadAll(folder, "./res")
    .then((result) => {
        console.log("Files downloaded!");
        
        // Create the bot
        let im = new ItemMachine();
        

        // Start the update loop for getting files from dropbox on change
        dbx.updateOnChange(folder, "./res", (files) => {
            im.onUpdate(files);
        });
        
        // Start the bot
        im.login(EnvVars.discordToken);

    })
    .catch((err) => {
        console.log(err);
    });