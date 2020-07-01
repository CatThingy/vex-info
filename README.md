# vex-info
A Discord bot to easily access data from VexDB and display it in a readable format.  
No bot invite link yet, due to it being in very early stages of development.
## Commands
### `help`
Lists command syntax and links to this page.

---
### `config`
Usage: `config [setting|reset] [value?]`  

Gets or sets the configuration of the bot. Can only be used by members who have permission to manage the server.
`setting` can be `prefix`, `region`, `timespan`, `max_events` or `reset`. If `value` is specified, the indicated setting will be set to that value. Otherwise, the setting's value is output in the channel where the command was called. If `reset` is specified as `setting`, all values will be set to their defaults. 

The `prefix` setting dictates the prefix used for all commands. The value for `prefix` can be any string. The default prefix is **v!**.  

The `region` setting is used as the default region for the `recent` and `upcoming` commands. The value for `region` can be any country, US state, or Canadian province. For US states and Canadian provinces, standard two-letter abbreviations can be used. This setting is unset by default.  

The `timespan` setting is used as the default timespan used for the `recent` and `upcoming` commands. The value for `timespan` should be given in the format [number][unit] with no spaces in between e.g. 1y for 1 year, 3m for 3 months. The default timespan is 30 days.  

The `max_events` setting dictates how many events the `recent` or `upcoming` commands should display in a channel. The value for `max_events` should be an integer, with a maximum of 25 due to limitations of Discord embeds The default value is 10.

The `max_awards` setting dictates how many awards the `awards` command show display in a channel. The value for `max_awards` should be an integer. Note that there is another limit based on character count inherent in the Discord API. The default value is 15.

---
### `event`
Usage: `event [SKU]`  
Displays information about the event with the specified SKU. 

---
### `upcoming`
Usage: `upcoming [region?] [timespan?]`  
Displays basic info about future events in the specified region, looking forward by the value of `timespan`.  

The value for `region` can be any country, US state, or Canadian province. For US states and Canadian provinces, standard two-letter abbreviations can be used. If `region` is not set, the server's `region` setting is used.  
The value for `timespan` should be given in the format [number][unit] with no spaces in between e.g. 1y for 1 year, 3m for 3 months. If `timestamp` is not set, the server's `timestamp` setting is used.

---
### `recent`
Usage: `recent [region?] [timespan?]`  
Displays basic info about past events in the specified region, looking back by the value of `timespan`.  

The value for `region` can be any country, US state, or Canadian province. For US states and Canadian provinces, standard two-letter abbreviations can be used. If `region` is not set, the server's `region` setting is used.  
The value for `timespan` should be given in the format [number][unit] with no spaces in between e.g. 1y for 1 year, 3m for 3 months. If `timestamp` is not set, the server's `timestamp` setting is used.

---
### `awards`
Usage: `awards [SKU | team]`

Shows all awards awarded at an event if the SKU is given, or shows all awards received by a team if their team number is given.