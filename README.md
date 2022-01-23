# PrivateRooms v2
Private rooms script for discord bot

### Main idea
Move away from the standard management of private rooms using chat commands (as implemented in the current public bots) and switch to managing rooms by temporarily transferring full rights to the owner of the private room.

### Todo list
- [x] Give full rights to the channel for its owner.
- [x] Mute and deaf voice channel members by its owner.
- [X] Un (deaf/mute) when exiting the private channel.
- [x] Participants whose punishment was issued by the administrator or a person with a given privilege won't be unmuted by voice switch or channel owner.
- [x] Give more \*immunity* for the private room owner (anyone may not mute room owner)
- [x] Add database integration. `MongoDB in priority` (Mongoose included, but may be changed in src/services)
- [x] Provide for the script to work in several guilds.
- [ ] Add additional functions for managing the private room for the user through commands.
- [x] Create a flexible config for customizing the script. (by options)
- [ ] Host a public bot to manage private rooms.
- [ ] Optimize database requests.


### Usage
1. Load file from `bundle/` into your bot folder.
2. Enter `require("./privaterooms-{version}.js")( Discord.Client() )` Or `require("./privaterooms-{version}.js")( Discord.Client(), {mongoURI} )` (if you haven't connected to db yet) in the main bot file

⚠️ You may specify other extra options to configure script


##### Options that may be transferred to script
```ts
export default function (client: Client, options?: PrivateRoomsOptions);

interface PrivateRoomsOptions {
    mongoURI?: string | undefined,
    minCooldownTime?: number | undefined,
    maxCooldownTime?: number | undefined,
    consoleLogsLabel?: string | undefined,
    botCommandsPrefix?: string | undefined
}
```
Example
```js
require("./privaterooms-2.0.0.js")( Discord.Client(), {
    mongoURI: "Your mongo URI",
    minCooldownTime: 20,
    maxCooldownTime: 360,
    consoleLogsLabel: "ROOMS",
    botCommandsPrefix: "pr#",
});
```

### Basic example
An example of connecting and using a script in your own bot

##### index.js
```js
const Discord = require('discord.js')
const client = new Discord.Client({intents: 32767 , partials: ["CHANNEL", "GUILD_MEMBER", "USER", "MESSAGE"]})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
  })

require('./privaterooms-2.0.0')(client, { mongoURI: "Your mongo URI here" })
client.login("Your bot token here")
```

### Running "as is"
To run the script "as is" you need to clone this repository and run the script using `npm run start`. 
Don't forget to preinstall Typescript and NodeJs first.

Before starting, also create `config.ts` file and fill it as indicated in `config.example.ts`

### About script
🔸 Administrator only 🔹 Moderator only
####Commands
- `$help` - show all commands
- `$moderators add <roleID> ..[roleID]` - add role to moderators list 🔸
- `$moderators remove <roleID> ..[roleID]` - remove role from moderators list 🔸
- `$moderators clear` - clear moderators list 🔸
- `$cooldown <time>` - set room creation cooldown (in seconds) 🔸
- `$creationchannel <channelID>` - change creationchannel for guild 🔸
- `$prefix <new prefix>` - change bot prefix for guild 🔸
- `pr#prefix` - show current prefix
- `pr#init <creationchannelID> [prefix] [cooldown]` - initialize bot for guild 🔸
- `/mute <userID> [reason]` - mute user (in all voice channels) 🔹
- `/deaf <userID> [reason]` - deaf user (in all voice channels) 🔹
- `/unmute <userID>` - unmute user (in all voice channels) 🔹
- `/undeaf <userID>` - undeaf user (in all voice channels) 🔹