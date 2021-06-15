/**
 * Copyright (C) 2021 zvykach https://github.com/zvykach/PrivateRooms/ 
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License 
 * as published by the Free Software Foundation, either version 3 of the License, or any later version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty 
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const config = {
    create_rooms_channel_id : "854182311155466261", // "Create a private room" channel ID
    moder_role : "" //people with this role may mute or deaf another users in private channels permanently
}

/**
 * ----------------------------------------------
 * Please do not change anything under this text,
 * if you don't know how does it work. Thanks!
 * ----------------------------------------------
 */
const Discord = require('discord.js')
const cooldowns = new Map()
const mutedInPrivate = []
const deafenedInPrivate = []
const withDeafToo = []
/**
 * @param {Discord.Client} client 
 */
module.exports = (client) => {
    client.on("voiceStateUpdate", async (oldVoiceState, newVoiceState) => {
        if (newVoiceState.channel) { // The member connected. to a channel.
            try {
                if (oldVoiceState.channel.parentID == oldVoiceState.guild.channels.cache.find(channel => channel.id === config.create_rooms_channel_id).parentID) { // if action in private channel
                    if (oldVoiceState.channel != newVoiceState.channel) {if (!oldVoiceState.channel.members.size && oldVoiceState.channelID != config.create_rooms_channel_id) oldVoiceState.channel.delete()} // if Empty -> delete channel
                    else muteOrDeafActions(oldVoiceState,newVoiceState) // check... if action is mute or deaf -> (un)mute/(un)deaf
                } //if action not in private -> return
            } catch (error) {}

            if (oldVoiceState.channel != newVoiceState.channel || withDeafToo.includes(newVoiceState.id)) { // if user goes to another channel
                    if (mutedInPrivate.includes(newVoiceState.id)) {
                        mutedInPrivate.splice(mutedInPrivate.indexOf(newVoiceState.id));
                        newVoiceState.setMute(false);
                        if (newVoiceState.serverDeaf && deafenedInPrivate.includes(newVoiceState.id)) withDeafToo.push(newVoiceState.id)
                        return
                    } // if Muted in Private -> unmute
                    else if (deafenedInPrivate.includes(newVoiceState.id)) {
                        deafenedInPrivate.splice(deafenedInPrivate.indexOf(newVoiceState.id));
                        newVoiceState.setDeaf(false);
                        if (withDeafToo.includes(newVoiceState.id)) withDeafToo.splice(withDeafToo.indexOf(newVoiceState.id));
                        return
                    } // if Deaf in Private -> unDeaf
            }
            if (newVoiceState.channelID != config.create_rooms_channel_id) return // if channel user go to is not 'Creating new' -> return
            if (!cooldowns.has("voiceCreate")) cooldowns.set("voiceCreate", new Discord.Collection())
            const current_time = Date.now()
            const time_stamps = cooldowns.get("voiceCreate")
            const cooldowns_amount = 10 * 1000
            if(time_stamps.has(newVoiceState.member.user.id)) {
                const expiration_time = time_stamps.get(newVoiceState.member.user.id)+cooldowns_amount
                if (current_time < expiration_time) {
                    const time_left = (expiration_time - current_time) / 1000
                    newVoiceState.kick()
                    const Emed = new Discord.MessageEmbed().setColor(0xFF0022).setDescription(`**Не так часто!** Подождите ещё **${time_left.toFixed(1)}**с. чтобы создать канал`)
                    newVoiceState.member.send(Emed).catch(() => console.log(generateTimeLog()+`\u001b[33mUnable to send message\u001b[0m ${newVoiceState.member.user.tag}`))
                    return
                }
            }
            let name = newVoiceState.member.nickname
            if (!name) name = newVoiceState.member.user.username
            newVoiceState.guild.channels.create(name+'\'s channel', {
                type: 'voice',
                parent: newVoiceState.guild.channels.cache.find(channel => channel.id === config.create_rooms_channel_id).parentID,
                permissionOverwrites: [
                   {
                     id: newVoiceState.member.user.id,
                     allow: ['MANAGE_CHANNELS','MOVE_MEMBERS','MANAGE_ROLES','MUTE_MEMBERS','DEAFEN_MEMBERS','VIEW_CHANNEL'],
                  },
                ],
              }).then((channeL) => {
                newVoiceState.setChannel(channeL.id)
                console.log(generateTimeLog()+`\u001b[32mVoice channel created\u001b[0m ${newVoiceState.member.user.tag}`)
                time_stamps.set(newVoiceState.member.user.id, current_time) //set cooldown for user
              }).catch(() => console.log(generateTimeLog()+`\u001b[31mVoice channel creation error\u001b[0m ${newVoiceState.member.user.tag}`))
        } else if (oldVoiceState.channel) { // The member disconnected from a channel.
            if (oldVoiceState.channel != newVoiceState.channel) {if (!oldVoiceState.channel.members.size && oldVoiceState.channelID != config.create_rooms_channel_id) return oldVoiceState.channel.delete()} // if Empty -> delete channel
        }})
        }

function muteOrDeafActions(oldVoiceState,newVoiceState) {
    if (oldVoiceState.serverMute != newVoiceState.serverMute) {//action is mute
        if (oldVoiceState.serverMute && !mutedInPrivate.includes(oldVoiceState.id)) ifActionNotByAdmin(newVoiceState,() => newVoiceState.setMute(true)) //if has been muted by admin
        else if (newVoiceState.serverMute && !mutedInPrivate.includes(newVoiceState.id)) ifActionNotByAdmin(newVoiceState,voiceState => mutedInPrivate.push(voiceState.id)) // add to mute list
        else if (mutedInPrivate.includes(newVoiceState.id)) mutedInPrivate.splice(mutedInPrivate.indexOf(newVoiceState.id)) // remove from mute list
    } else if (oldVoiceState.serverDeaf != newVoiceState.serverDeaf) { //action is deaf
        if (oldVoiceState.serverDeaf && !deafenedInPrivate.includes(oldVoiceState.id)) ifActionNotByAdmin(newVoiceState,() => newVoiceState.setDeaf(true)) //if has been deafened by admin
        else if (newVoiceState.serverDeaf && !deafenedInPrivate.includes(newVoiceState.id)) ifActionNotByAdmin(newVoiceState,voiceState => deafenedInPrivate.push(voiceState.id)) // add to deaf list
        else if (deafenedInPrivate.includes(newVoiceState.id)) deafenedInPrivate.splice(deafenedInPrivate.indexOf(newVoiceState.id)) // remove from deaf list
    }
    return
}

function generateTimeLog() {
    let today = new Date()
    let date = today.getFullYear()+'.'+(today.getMonth()+1)+'.'+today.getDate()
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    return `${date} ${time} >> `
}
function ifActionNotByAdmin(newVoiceState,callback) {
    newVoiceState.guild.fetchAuditLogs({type:24,limit:1,user:newVoiceState})
            .then(audit => {
                const executor = audit.entries.first().executor
                const member = newVoiceState.guild.members.cache.find(_member => _member.id === executor.id)
                if (member && (!(config.moder_role && member.roles.cache.has(config.moder_role)) && !member.hasPermission('ADMINISTRATOR'))) callback(newVoiceState)
            })
            .catch(console.error);
}