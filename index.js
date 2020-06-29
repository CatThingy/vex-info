"use strict";

const Discord = require("discord.js");
const Enmap = require("enmap");

const config = require("./config.json");

const client = new Discord.Client();
const settings = new Enmap({ name: "settings", fetchAll: false, autoFetch: true });

const argRegex = /(?:"(.*?)")|(?:\b(.+?)(?:\s|$))/g;

client.login(config.token);

// Prevent deleted servers from taking up database space
client.on("guildDelete", guild => settings.delete(guild.id));

client.on("message", message => {
    // Prevent bot loops
    if (message.author.bot) {
        return;
    }

    const serverSettings = settings.ensure(message.guild.id, config.default_settings);

    let messageText = message.content;
    if (messageText.startsWith(serverSettings.prefix)) {
        messageText = messageText.slice(serverSettings.prefix.length);

        // Parse input, stripping off the command prefix and
        // separating arguments. Spaces in quotes are ignored,
        // so the whole quote counts as one argument.
        const args = [...messageText.matchAll(argRegex)].map(v => v.slice(1).filter(n => n !== undefined)[0]);

    }
});