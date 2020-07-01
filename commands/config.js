const settings = require("../settings.js");
const config = require("../config.json");

const { parseTime, formatTime, deabbreviation_dict } = require("../helpers.js");
module.exports = {
    name: "config",
    description: "Configure the bot",
    execute(message, args, serverSettings) {
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
                else if (args[1]) {
                    message.channel.send("The default timespan should be formatted as [number][unit] without spaces, like '1m', '3w', '1y', etc.")
                }
                else {
                    message.channel.send("The default timespan for time-based commands is " + formatTime(serverSettings.default_timespan));
                }
            }
            else if (args[0] == "event_count") {
                if (!isNaN(args[1])) {
                    settings.set(message.guild.id, Math.min(25, ~~args[1]), "max_events");
                    message.channel.send("The maximum number of events listed has been set to " + Math.min(25, ~~args[1]));
                }
                else if (args[1]) {
                    message.channel.send("The maximum number of events can only be a number.");
                }
                else {
                    message.channel.send("The maximum number of events listed is set to " + serverSettings.max_events);
                }
            }
            else if (args[0] == "award_count") {
                if (!isNaN(args[1])) {
                    settings.set(message.guild.id, Math.min(100, ~~args[1]), "max_awards");
                    message.channel.send("The maximum number of awards listed has been set to " + Math.min(100, ~~args[1]));
                }
                else if (args[1]) {
                    message.channel.send("The maximum number of awards can only be a number.");
                }
                else {
                    message.channel.send("The maximum number of awards listed is set to " + serverSettings.max_events);
                }
            }
            else if (args[0] == "reset") {
                settings.set(message.guild.id, config.default_settings);
                message.channel.send("All settings have been reset to the defaults.");
            }
        }

    }
}
