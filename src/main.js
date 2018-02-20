/** @module main */
const ItemMachine = require("./bot.js");
const DropboxSync = require("./dropbox-sync.js");
const EnvVars = require("./env-vars.js");

/** Create the bot, and log into the server */
/*
let im = new ItemMachine();
im.login(EnvVars.discordToken);
*/
let dbx = new DropboxSync(EnvVars.dropboxToken);
dbx.downloadAll("/EKMachineTest", "./res")
	.then((result) => {
	})
	.catch((err) => {
		console.log(err);
	});