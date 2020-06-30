const { getBetween, toTitleCase, parseTime, deabbreviation_dict, regions } = require("../helpers.js");
const fetch = require("node-fetch");

module.exports = {
    name: "upcoming",
    description: "Get upcoming events in the region",
    execute(message, args, serverSettings) {
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
}
