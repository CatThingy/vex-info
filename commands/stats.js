const { seasons, toTitleCase } = require("../helpers.js");
const fetch = require("node-fetch");

module.exports = {
    name: "stats",
    description: "Gets team performance statistics",
    async execute(message, args, serverSettings) {
        // Join together season name
        args = [args[0].toUpperCase(), toTitleCase(args.slice(1).join(" "))];

        // Default to most recent team added
        if (args[1] == "") {
            args[1] = seasons[0];
        }
        // Verify existence of team
        let teamData = await fetch("https://api.vexdb.io/v1/get_teams?team=" + args[0])
            .then(res => res.json());
        if (teamData.size == 0) {
            message.channel.send(`No team with number ${args[0]} was found.`);
            return;
        }

        // Ensure season specified exists
        if (!seasons.includes(args[1])) {
            message.channel.send(args[1] + " is not a valid season.")
            return;
        }
        const response = await message.channel.send("Getting competition data...");
        let seasonData = await fetch(`https://api.vexdb.io/v1/get_rankings?team=${args[0]}&season=${args[1]}`)
            .then(res => res.json());
        if (seasonData.size == 0) {
            response.edit(`No data found for team ${args[0]} in ${args[1]}.`);
            return;
        }
        let oprAvg, dprAvg, ccwmAvg;
        let win, loss, tie;
        let autonWins;
        oprAvg = dprAvg = ccwmAvg = win = loss = tie = autonWins = 0;
        for (const result of seasonData.result) {
            oprAvg += result.opr;
            dprAvg += result.dpr;
            win += result.wins;
            loss += result.losses;
            tie += result.ties;
            // 6 AP per auton win
            autonWins += result.ap / 6;
        }
        oprAvg /= seasonData.size;
        dprAvg /= seasonData.size;

        ccwmAvg = oprAvg - dprAvg;
        const embed = {
            title: `${args[0]} ${args[1]} Stats`,
            fields: [
                {
                    name: "Average OPR",
                    value: oprAvg.toFixed(2),
                    inline: true
                },
                {
                    name: "Average DPR",
                    value: dprAvg.toFixed(2),
                    inline: true
                },
                {
                    name: "Average CCWM",
                    value: ccwmAvg.toFixed(2),
                    inline: true
                },
                {
                    name: "W-L-T",
                    value: `${win}-${loss}-${tie}`,
                    inline: true
                },
                {
                    name: "Auton Win%",
                    value: (autonWins / (win + loss + tie) * 100).toFixed(2) + "%",
                    inline: true
                }
            ]
        }
        response.edit({ content: "", embed: embed });
    }
}
