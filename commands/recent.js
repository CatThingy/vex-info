const { getBetween, toTitleCase, parseTime, deabbreviation_dict, regions } = require("../helpers.js");
const fetch = require("node-fetch");

module.exports = {
    name: "recent",
    description: "Get recent events in the region",
    async execute(message, args, serverSettings) {
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
        const response = await message.channel.send("Getting events...")

        let data = await (fetch(url)
            .then(res => res.json()));

        if (data.result.length === 0) {
            response.edit(`No recent events could be found in ${toTitleCase(region)}.`);
            return;
        }
        let embed = getBetween(startDate, Date.now(), data.result, region, false);

        if (embed.fields.length > serverSettings.max_events) {
            response.edit("Too many events, DM'd");
            message.author.send({ embed: embed });
        }
        else {
            response.edit({ content: "", embed: embed });
        }
    }
}
