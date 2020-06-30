deabbreviation_dict = { "ab": "Alberta", "ak": "Alaska", "al": "Alabama", "ar": "Arkansas", "az": "Arizona", "bc": "British Columbia", "ca": "California", "co": "Colorado", "ct": "Connecticut", "dc": "District of Columbia", "de": "Delaware", "fl": "Florida", "ga": "Georgia", "hi": "Hawaii", "ia": "Iowa", "id": "Idaho", "il": "Illinois", "in": "Indiana", "ks": "Kansas", "ky": "Kentucky", "la": "Louisiana", "ma": "Massachusetts", "mb": "Manitoba", "md": "Maryland", "me": "Maine", "mi": "Michigan", "mn": "Minnesota", "mo": "Missouri", "ms": "Mississippi", "mt": "Montana", "nb": "New Brunswick", "nc": "North Carolina", "nd": "North Dakota", "ne": "Nebraska", "nf": "Newfoundland", "nh": "New Hampshire", "nj": "New Jersey", "nm": "New Mexico", "ns": "Nova Scotia", "nt": "Northwest Territory", "nu": "Nunavut", "nv": "Nevada", "ny": "New York", "oh": "Ohio", "ok": "Oklahoma", "on": "Ontario", "or": "Oregon", "pa": "Pennsylvania", "pe": "Prince Edward Island", "pei": "Prince Edward Island", "qc": "Quebec", "ri": "Rhode Island", "sc": "South Carolina", "sd": "South Dakota", "sk": "Saskatchewan", "tn": "Tennessee", "tx": "Texas", "ut": "Utah", "va": "Virginia", "vt": "Vermont", "wa": "Washington", "wi": "Wisconsin", "wv": "West Virginia", "wy": "Wyoming", "yt": "Yukon" };
regions = Object.values(deabbreviation_dict).join(",").toLowerCase()

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

module.exports = {
    deabbreviation_dict: deabbreviation_dict,
    regions: regions,
    formatEvent: formatEvent,
    getBetween: getBetween,
    toTitleCase: toTitleCase,
    parseTime: parseTime,
    formatTime: formatTime,
}
