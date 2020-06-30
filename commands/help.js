module.exports = {
    name: "help",
    description: "Lists command syntax",
    execute(message, args, serverSettings) {
        const helpMessage = 
        "```css\nhelp\n" + (message.member.hasPermission("MANAGE_GUILD") ?
        "config [setting|reset] [value?]\n" : "") +
        "event [SKU]\n" +
        "upcoming [region?] [timespan?]\n"+
        "recent [region?] [timespan?]\n```";
        message.channel.send({embed: {
            title: "vex-info Command List",
            url: "https://github.com/CatThingy/vex-info#commands",
            fields: [
                {
                    name: "\u200b",
                    value: helpMessage,
                }
            ],
            footer: "Click the top link for more detailed information."
        }});
    }
}