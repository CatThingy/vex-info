"use strict";
// Library initialization
const Discord = require("discord.js");
const Enmap = require("enmap");
const fetch = require("node-fetch");

const config = require("./config.json");

// Contains deabbrevations for US states / Canadian provinces
const deabbreviation_dict = {
    "ab": "Alberta",
    "ak": "Alaska",
    "al": "Alabama",
    "ar": "Arkansas",
    "az": "Arizona",
    "bc": "British Columbia",
    "ca": "California",
    "co": "Colorado",
    "ct": "Connecticut",
    "dc": "District of Columbia",
    "de": "Delaware",
    "fl": "Florida",
    "ga": "Georgia",
    "hi": "Hawaii",
    "ia": "Iowa",
    "id": "Idaho",
    "il": "Illinois",
    "in": "Indiana",
    "ks": "Kansas",
    "ky": "Kentucky",
    "la": "Louisiana",
    "ma": "Massachusetts",
    "mb": "Manitoba",
    "md": "Maryland",
    "me": "Maine",
    "mi": "Michigan",
    "mn": "Minnesota",
    "mo": "Missouri",
    "ms": "Mississippi",
    "mt": "Montana",
    "nb": "New Brunswick",
    "nc": "North Carolina",
    "nd": "North Dakota",
    "ne": "Nebraska",
    "nf": "Newfoundland",
    "nh": "New Hampshire",
    "nj": "New Jersey",
    "nm": "New Mexico",
    "ns": "Nova Scotia",
    "nt": "Northwest Territory",
    "nu": "Nunavut",
    "nv": "Nevada",
    "ny": "New York",
    "oh": "Ohio",
    "ok": "Oklahoma",
    "on": "Ontario",
    "or": "Oregon",
    "pa": "Pennsylvania",
    "pe": "Prince Edward Island",
    "pei": "Prince Edward Island",
    "qc": "Quebec",
    "ri": "Rhode Island",
    "sc": "South Carolina",
    "sd": "South Dakota",
    "sk": "Saskatchewan",
    "tn": "Tennessee",
    "tx": "Texas",
    "ut": "Utah",
    "va": "Virginia",
    "vt": "Vermont",
    "wa": "Washington",
    "wi": "Wisconsin",
    "wv": "West Virginia",
    "wy": "Wyoming",
    "yt": "Yukon"
}
const regions = Object.values(deabbreviation_dict).join(",").toLowerCase();

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

        // Configure the bot
        if (command == "config") {
            if (message.member.hasPermission("MANAGE_GUILD")) {
                if (args[0] == "prefix") {
                    if (args[1]) {
                        settings.set(message.guild.id, args[1], "prefix");
                        message.channel.send("Command prefix has been set to " + args[1]);
                    }
                    else {
                        message.channel.send("The current prefix is " + serverSettings.prefix);
                    }
                }
                else if (args[0] == "region") {
                    if (args[1]) {
                        if (Object.keys(deabbreviation_dict).includes(args[1])) {
                            settings.set(message.guild.id, deabbreviation_dict[args[1]], "default_region");
                        }
                        else if (args[1] == "none") {
                            settings.set(message.guild.id, "", "default_region");
                            message.channel.send("The default region has been reset");
                            return;
                        }
                        else {
                            settings.set(message.guild.id, args[1], "default_region");
                        }
                        message.channel.send("The default region has been set to " + settings.get(message.guild.id, "default_region"));
                    }
                    else {
                        if (serverSettings.defaultRegion) {
                            message.channel.send("The default region is currently " + serverSettings.defaultRegion);
                        }
                        else {
                            message.channel.send("There is no default region set.");
                        }
                    }
                }
                else if (args[0] == "timespan") {
                    if (parseTime(args[1])) {
                        settings.set(message.guild.id, parseTime(args[1]), "default_timespan");
                        message.channel.send("The default timespan for time-based commands has been set to " + formatTime(settings.get(message.guild.id, "default_timespan")))
                    }
                    else if(args[1]) {
                        message.channel.send("The default timespan should be formatted as [number][unit] without spaces, like '1m', '3w', '1y', etc.")
                    }
                    else{
                        message.channel.send("The default timespan for time-based commands is " + formatTime(serverSettings.default_timespan));
                    }
                }
                else if (args[0] == "event_count") {
                    if (!isNaN(args[1])) {
                        settings.set(message.guild.id, Math.min(25, ~~args[1]), "max_embed_length");
                        message.channel.send("The maximum number of events listed has been set to " + Math.min(25, ~~args[1]));
                    }
                    else if (args[1]) {
                        message.channel.send("The maximum number of events can only be a number.");
                    }
                    else {
                        message.channel.send("The maximum number of events displayed is set to " + serverSettings.max_embed_length);
                    }
                }
                else if (args[0] == "reset") {
                    settings.set(message.guild.id, config.default_settings);
                    message.channel.send("All settings have been reset to the defaults.");
                }
            }
            else {
                return;
            }
        }

        // Get event by SKU
        else if (command == "event") {
            fetch("https://api.vexdb.io/v1/get_events?sku=" + args[0])
                .then(res => res.json())
                .then(data => formatEvent(data.result[0]))
                .then(embed => {
                    message.channel.send({ embed: embed });
                })
                .catch(e => { message.channel.send(`No event found with the SKU ${args[0]}.`); console.log(e); });
        }

        // Get upcoming events in the region
        else if (command == "upcoming") {
            // Parse region abbreviations, as well as allowing for a default region.
            let region = serverSettings.default_region;
            if (args[0]) {
                if (Object.keys(deabbreviation_dict).includes(args[0])) {
                    region = deabbreviation_dict[args[0]];
                }
                else if (!parseInt(args[0])) {
                    region = args[0];
                }
                else {
                    args[1] = args[0];
                }
            }

            if (region == "") {
                message.channel.send("Please specify a region e.g: Alberta, NY, texas.");
                return;
            }

            let url = "https://api.vexdb.io/v1/get_events?status=current,future";
            if (regions.includes(region.toLowerCase())) {
                url += "&region=" + region;
            }
            else {
                url += "&country=" + region;
            }

            let endDate = Date.now() + serverSettings.default_timespan;
            if (args[1]) {
                let duration = parseTime(args[1]);
                if (duration) {
                    endDate = Date.now() + parseTime(args[1]);
                }
            }

            fetch(url)
                .then(res => res.json())
                .then(data => getBetween(Date.now(), endDate, data.result, region))
                .then(embed => {
                    if (embed.fields.length > serverSettings.max_embed_length) {
                        message.channel.send("Too many events, DM'd");
                        message.author.send({ embed: embed });
                    }
                    else {
                        message.channel.send({ embed: embed });
                    }
                })
                .catch(e => { message.channel.send(`No upcoming events could be found in ${toTitleCase(region)}.`); console.log(e); });
        }

        // Get recent events in the region
        else if (command == "recent") {
            // Parse region abbreviations, as well as allowing for a default region.
            let region = serverSettings.default_region;
            if (args[0]) {
                if (Object.keys(deabbreviation_dict).includes(args[0])) {
                    region = deabbreviation_dict[args[0]];
                }
                else if (!parseInt(args[0])) {
                    region = args[0];
                }
                else {
                    args[1] = args[0];
                }
            }

            if (region == "") {
                message.channel.send("Please specify a region e.g: Alberta, NY, texas.");
                return;
            }

            let url = "https://api.vexdb.io/v1/get_events?status=past,current";
            if (regions.includes(region.toLowerCase())) {
                url += "&region=" + region;
            }
            else {
                url += "&country=" + region;
            }

            let startDate = Date.now() - serverSettings.default_timespan;
            if (args[1]) {
                let duration = parseTime(args[1]);
                if (duration) {
                    startDate = Date.now() - parseTime(args[1]);
                }
            }

            fetch(url)
                .then(res => res.json())
                .then(data => getBetween(startDate, Date.now(), data.result, region, false))
                .then(embed => {
                    if (embed.fields.length > serverSettings.max_embed_length) {
                        message.channel.send("Too many events, DM'd");
                        message.author.send({ embed: embed });
                    }
                    else {
                        message.channel.send({ embed: embed });
                    }
                })
                .catch(e => { message.channel.send(`No recent events could be found in ${toTitleCase(region)}.`); console.log(e); });
        }
    }
});

async function formatEvent(eventData) {
    let embed = {
        title: eventData.name,
        description: eventData.season,
        url: `https://robotevents.com/${eventData.sku}.html`,
        fields: []
    }

    if (eventData.program === "VRC") {
        embed.color = "#da262e";
    }
    else if (eventData.program === "VEXU") {
        embed.color = "#0d964c";
    }


    //Check if the value is filled in the API to prevent empty/useless headers
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
    });
    return embed;
}

async function getBetween(from, to, events, region, descending = true) {

    let valid_events = [];
    for (const event of events) {
        if (Date.parse(event.end) < to && Date.parse(event.end) > from) {
            valid_events.push(event);
        }
    }
    // Sort by date, ascending so it displays descending down the page
    if (descending) {
        valid_events = valid_events.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    }
    else {
        valid_events = valid_events.sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
    }

    let embed = {
        fields: []
    };

    if (Math.floor(from / 864e5) < Math.floor(Date.now() / 864e5)) {
        embed.title = "Recent events in " + toTitleCase(region);
        embed.description = "Past events since " + new Date(from).toUTCString().substring(0, 16);
    }
    else {
        embed.title = "Upcoming events in " + toTitleCase(region);
        embed.description = "Future events up to " + new Date(to).toUTCString().substring(0, 16);
    }

    if (valid_events.length == 0) {
        return Promise.reject();
    }

    for (const event of valid_events) {
        if (embed.fields.length < 25) {
            embed.fields.push({
                name: event.name,
                value: `[${event.sku}](https://robotevents.com/${event.sku})\nDate: ${new Date(event.start).toUTCString().substring(5, 16)}`
            });
        }
        else {
            embed.footer = { text: "The number of events listed have been capped to 25 due to Discord API restrictions." }
            break;
        }
    }
    return embed;
}

function toTitleCase(str) {
    return str.replace(/\b(\w)(?!(\w{0,2}\b))/g, m => m.toUpperCase());
}

function parseTime(str) {
    let constant = parseInt(str);
    if (!constant) {
        return;
    }
    let unit = str.match(/[a-zA-Z]+/)[0].toLowerCase();

    if (unit.startsWith("d")) {
        return constant * 864e5;
    }
    else if (unit.startsWith("w")) {
        return constant * 6048e5;
    }
    else if (unit.startsWith("m")) {
        return constant * 2592e6;
    }
    else if (unit.startsWith("y")) {
        return constant * 31536e6;
    }
}

function formatTime(ms) {
    if (ms < 6048e5) {
        return ~~(ms / 864e5) + "d\n";
    }
    else if (ms < 2592e6) {
        return ~~(ms / 6048e5) + "w\n";
    }
    else if (ms < 31536e6) {
        return ~~(ms / 2592e6) + "m\n";
    }
    else {
        return ~~(ms / 31536e6) + "y\n";
    }

}