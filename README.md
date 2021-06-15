# PrivateRooms
Private rooms script for discord bot

### Main idea
Move away from the standard management of private rooms using chat commands (as implemented in the current public bots) and switch to managing rooms by temporarily transferring full rights to the owner of the private room.

### Todo list
- [x] Give full rights to the channel for its owner.
- [x] Mute and deaf voice channel members by its owner.
- [X] Un (deaf/mute) when exiting the private channel.
- [x] Participants whose punishment was issued by the administrator or a person with a given privilege won't be unmuted by voice switch or channel owner.
- [ ] Give more \*immunity* for the private room owner
- [ ] Add database integration. `MongoDB in priority`
- [ ] Provide for the script to work in several guilds.
- [ ] Add additional functions for managing the private room for the user through commands.
- [ ] Create a flexible config for customizing the script.
- [ ] Host a public bot to manage private rooms.


### Usage
1. Load into bot folder.
2. Script settings
   - Create new category with "Create a private room" channel.
   - Copy channelID to the `create_rooms_channel_id` variable in script file.
   - Enter roleID with moderation status into `moder_role` variable (May be empty)
3. Enter `require(./private-rooms.js)( Discord.Client() )` in the main bot file.

⚠️ The category in which the bot works, should initially consist only of the "Create a private room" channel

### Basic example
An example of connecting and using a script in your own bot
##### index.js
```js
const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
  })

require('./private-rooms')(client)
client.login("Your bot token here")
```
##### Config block in private-rooms.js
```js
const config = {
    create_rooms_channel_id : "222555666777722221", // "Create a private room" channel ID
    moder_role : "" //people with this role may mute or deaf another users in private channels permanently
}
