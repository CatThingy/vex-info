const fetch = require("node-fetch");

module.exports = {
    name: "event",
    description:"Get event by SKU",
    execute(message, args, serverSettings) {
        fetch("https://api.vexdb.io/v1/get_events?sku=" + args[0])
            .then(res => res.json())
            .then(data => formatEvent(data.result[0]))
            .then(embed => {
                message.channel.send({ embed: embed });
            })
            .catch(e => { message.channel.send(`No event found with the SKU ${args[0].toUpperCase()}.`); console.log(e); });
    }
}

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
