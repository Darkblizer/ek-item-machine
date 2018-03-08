# EK Item Machine

A discord bot for dispensing items and other utilities, automatically downloaded from a dropbox folder

## Installation

```bash
npm install
```

In order to use EK Item Machine, you will need to configure the following environment variables:
- `ITEM_MACHINE_DISCORD_TOKEN`: The token to the discord bot
- `ITEM_MACHINE_DROPBOX_TOKEN`: The token to your dropbox
- `ITEM_MACHINE_DROPBOX_FOLDER`: The dropbox folder where all of the files are

## Command guide

The bot features some built-in commands:
- `!lastupdate`: Reports the last time the file received updates from the dropbox
- `!ping`: Pings the bot (to make sure it's still alive)

Aside from the above commands, all commands are defined in the Commands.json, which is to be placed in the linked dropbox folder.
The commands.json contains multiple commands by calling name, which contains information about the command:
- `file`: The file to read a line from for the command
- `message`: The message to read out when the command is called. `$l` is the line read from the file, and `$n` is the username of the person who called the command. `$$` is the character "$". `$1, $2, ... $9` are parameters specified by the user in the command call.
- `paramDefaults`: An array of default parameters to use if the user does not specify one, beginning with parameter 1, 2, etc.
    