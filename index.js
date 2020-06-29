"use strict";
// Library initialization
const Discord = require("discord.js");
const Enmap = require("enmap");
const fetch = require("node-fetch");

const config = require("./config.json");

const client = new Discord.Client();
const settings = new Enmap({ name: "settings", fetchAll: false, autoFetch: true });

const argRegex = /["'](.+?)["']|\b(.+?)(?:\s|$)/g;

client.login(config.token);

// Prevent deleted servers from taking up database space
client.on("guildDelete", guild => settings.delete(guild.id));

client.on("message", message => {
    if (message.author.bot || !message.guild)
        return;

    const serverSettings = settings.ensure(message.guild.id, config.default_settings);

    let messageText = message.content.toLowerCase();
    if (messageText.startsWith(serverSettings.prefix)) {
        messageText = messageText.slice(serverSettings.prefix.length);

        // Parse input, stripping off the command prefix and
        // separating arguments. Spaces in quotes are ignored,
        // so the whole quote counts as one argument.
        const args = [...messageText.matchAll(argRegex)].map(v => v.slice(1).filter(n => n !== undefined)[0]);
        const command = args.shift();

        // Get event by SKU
        if (command == "event") {
            fetch("https://api.vexdb.io/v1/get_events?sku=" + args[0])
                .then(res => res.json())
                .then(data => message.channel.send({ embed: formatEvent(data.result[0]) }))
                .catch(e => message.channel.send(`No event found with the SKU ${args[0]}.`));
        }
    }
});

function formatEvent(eventData) {
    let embed = {
        title: eventData.name,
        description: eventData.season,
        fields: []
    }

    if (eventData.program === "VRC") {
        embed.color = "#da262e"
    }
    else if (eventData.program === "VEXU") {
        embed.color = "#0d964c"
    }

    if (eventData.loc_venue) {
        embed.fields.push({
            name: "Venue",
            value: eventData.loc_venue,
            inline: true
        });
    }
    if (eventData.loc_address1) {
        embed.fields.push({
            name: "Address",
            value: eventData.loc_address1,
            inline: true
        });
    }
    if (eventData.loc_address2) {
        embed.fields.push({
            name: "Address",
            value: eventData.loc_address2,
            inline: true
        });
    }
    //Separator
    embed.fields.push({
        name: "\u200b",
        value: "\u200b"
    });

    if (eventData.loc_city) {
        embed.fields.push({
            name: "City",
            value: eventData.loc_city,
            inline: true
        });
    }
    if (eventData.loc_region) {
        embed.fields.push({
            name: "Region",
            value: eventData.loc_region,
            inline: true
        });
    }

    embed.fields.push({
        name: "Date",
        value: new Date(eventData.start).toUTCString().substring(0, 16)
    })
    return embed;
}