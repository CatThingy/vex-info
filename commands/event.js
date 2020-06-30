const { formatEvent } = require("../helpers.js");
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
            .catch(e => { message.channel.send(`No event found with the SKU ${args[0]}.`); console.log(e); });
    }
}
