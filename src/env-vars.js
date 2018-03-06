/** @module env-vars */
/**
    An object containing the necessary environment variables for
    connecting with other services like Discord and Dropbox
*/
module.exports = {
    /** The token to log into discord */
    discordToken: process.env.ITEM_MACHINE_DISCORD_TOKEN,
    /** The token to access dropbox */
    dropboxToken: process.env.ITEM_MACHINE_DROPBOX_TOKEN
};