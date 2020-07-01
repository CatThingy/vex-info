module.exports = {
    name: "help",
    description: "Lists command syntax",
    execute(message, args, serverSettings) {
        message.channel.send({
            embed: {
                author: {
                    name: "Prefix: " + serverSettings.prefix
                },
                title: "vex-info Command List",
                url: "https://github.com/CatThingy/vex-info#commands",
                fields: [
                    {
                        name: "config [setting|reset] [value]",
                        value: "Gets or sets the configuration of the bot. Can only be used by members who have permission to manage the server.",
                    },
                    {
                        name: "event [SKU]",
                        value: "Displays information about the event with the specified SKU.",
                    },
                    {
                        name: "upcoming [region?] [timespan?]",
                        value: "Displays basic info about future events in the specified region, looking forward by the value of `timespan`.",
                    },
                    {
                        name: "recent [region?] [timespan?]",
                        value: "Displays basic info about past events in the specified region, looking back by the value of `timespan`.",
                    },
                    {
                        name: "awards [SKU | team]",
                        value: "Shows all awards awarded at the event with the given SKU or shows all awards received by the specified team."
                    }
                ],
                footer: {
                    text: "Click top link for more detailed information."
                }
            }
        });
    }
}