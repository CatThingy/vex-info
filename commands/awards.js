const fetch = require("node-fetch");
const { seasons } = require("../helpers.js");
module.exports = {
    name: "awards",
    description: "Lists award winners at an event or awards won by a team.",
    async execute(message, args, serverSettings) {
        const embed = {
            fields: []
        };
        let awards;
        let response;
        let errored = false;
        // Event SKU given
        if (args[0].match(/[a-zA-Z]{2}-[a-zA-Z]{3}-\d{2}-\d{4}/)) {
            // Verify existence of event and get name of event.
            let eventInfo = await fetch("https://api.vexdb.io/v1/get_events?sku=" + args[0])
                .then(res => res.json());

            if (eventInfo.size == 0) {
                message.channel.send(`No event found with the SKU ${args[0].toUpperCase()}.`);
                return;
            }
            embed.title = eventInfo.result[0].name + " Awards";
            embed.url = "https://robotevents.com/" + args[0] + "#awards";

            if (errored) {
                return;
            }
            response = await message.channel.send("Getting event data...");
            awards = (await fetch("https://api.vexdb.io/v1/get_awards?sku=" + args[0])
                .then(res => res.json())).result;

            for (const award of awards) {
                // Add commas instead of creating new fields when there are identical awards
                if (embed.fields.length > 0 && embed.fields[embed.fields.length - 1].name == award.name) {
                    embed.fields[embed.fields.length - 1].value += ", " + award.team;
                }
                else {
                    embed.fields.push({ name: award.name, value: award.team, inline: true });
                }
            }
        }
        // Team ID given
        else {
            // Verify existence of team
            let teamInfo = await fetch("https://api.vexdb.io/v1/get_teams?team=" + args[0])
                .then(res => res.json());
            if (teamInfo.size == 0) {
                message.channel.send(`No team found with the number ${args[0].toUpperCase()}.`);
                return;
            }
            embed.title = args[0].toUpperCase();
            let totalAwards = 0;
            response = await message.channel.send("Getting award data...");
            // Get awards for each season
            for (const season of seasons) {
                awards = (await fetch(`https://api.vexdb.io/v1/get_awards?team=${args[0]}&season=${season}`)
                    .then(res => res.json()));

                let awardList = new Map();
                for (const award of awards.result) {
                    totalAwards++;
                    if (totalAwards > serverSettings.max_awards) {
                        awardList.set(award.sku, (awardList.has(award.sku) ? awardList.get(award.sku) + "\n" : "") + `...`);
                        break;
                    }
                    if (awardList.has(award.sku)) {
                        awardList.set(award.sku, awardList.get(award.sku) + "\n" + award.name.replace(/ \(vrc\/vexu\)/i, ""));
                    }
                    else {
                        awardList.set(award.sku, award.name.replace(/ \(vrc\/vexu\)/i, ""));
                    }
                }
                if (awards.size > 0) {
                    embed.fields.push({
                        name: season + ` (${awards.size})`,
                        value: "\u200b",
                        inline: true
                    });
                    for (const award of awardList) {
                        if (embed.fields[embed.fields.length - 1].value.length > 1e3) {
                            embed.fields[embed.fields.length - 1].value += "\n..."
                            break;
                        }
                        if (award[1] === "...") {
                            embed.fields[embed.fields.length - 1].value += `${award[1]}\n`
                        }
                        else {
                            embed.fields[embed.fields.length - 1].value += `[**${award[0]}**](https://robotevents.com/${award[0]}.html)\n${award[1]}\n`
                        }
                    }
                }
            }
        }
        response.edit({ content: "", embed: embed });
    }
}
