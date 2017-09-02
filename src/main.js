/** @module main */
const ItemMachine = require("./bot.js");
const EnvVars = require("./env-vars.js");

/** Create the bot, and log into the server */
let im = new ItemMachine();
im.login(EnvVars.token);