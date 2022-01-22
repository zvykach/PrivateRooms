import {IEvent} from '@/interfaces/IEvent'
import {Permissions, VoiceState} from 'discord.js'
import {GuildService} from "@/services/guild.service";
import {channelCreationError, cooldownTime} from "@/utils/embeds.util";
import {VoiceChannelService} from "@/services/voiceChannel.service";
import {checkIfChannelEmptyAndDelete} from "@/utils/check.utils";

function setNewTimer(key: string, msTime: number) {
    return setTimeout(() => {
        creationCooldown.delete(key);
    }, msTime);
}

const creationCooldown = new Map<string, IUserCooldown>();
interface IUserCooldown {
    until: number,
    timer: NodeJS.Timeout
}

const event: IEvent<"joinedPrivateRoomCreation"> = {
    name: "joinedPrivateRoomCreation",
    run: async (oldState: VoiceState, newState: VoiceState) => {
        if (oldState.channelId) {
            await checkIfChannelEmptyAndDelete(oldState);
        }

        const cooldownKey = `${newState.guild.id}:${newState.id}`;

        let userCooldown = creationCooldown.get(cooldownKey);
        const now = Date.now();

        if (userCooldown) {
            await newState.member?.send({embeds:[cooldownTime(((userCooldown.until - now) / 1000).toString())]});
            await newState.disconnect("Cooldown");
            return;
        }

        let guildCooldown = await GuildService.getCooldownTime(newState.guild.id);
        if (!guildCooldown) {
            await newState.member?.send({embeds:[channelCreationError]});
            await newState.disconnect("Error");
            return;
        }
        guildCooldown *= 1000;

        userCooldown = {
            until: now + guildCooldown,
            timer: setNewTimer(cooldownKey, guildCooldown)
        }
        creationCooldown.set(cooldownKey, userCooldown);

        // const createPrivateRoomChannelId = await GuildService.getCreatePrivateChannelId(newState.guild.id);
        // if (!createPrivateRoomChannelId) {
        //     await newState.member?.send({embeds:[channelCreationError]});
        //     return;
        // }

        // const parentId = newState.guild.channels.cache.find(channel => channel.id === createPrivateRoomChannelId)?.parentId
        // if (!parentId) {
        //     await newState.member?.send({embeds:[channelCreationError]});
        //     return;
        // }

        const name = newState.member?.nickname
            ?? newState.member?.user.username
            ?? 'Someone';

        const parentId = newState.channel!.parentId;
        if (!parentId) {
            await newState.member?.send({embeds:[channelCreationError]});
            return;
        }

        const channel = await newState.guild.channels.create(name+'\'s channel', {
            type: 'GUILD_VOICE',
            parent: parentId,
            permissionOverwrites: [
                {
                    id: newState.id,
                    allow: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MOVE_MEMBERS,
                            Permissions.FLAGS.MUTE_MEMBERS, Permissions.FLAGS.DEAFEN_MEMBERS],
                },
            ],
        })

        await VoiceChannelService.addNewChannel(channel.id, newState.id);
        await newState.setChannel(channel.id, 'New private room');
        console.log(`\u001b[32mVoice channel created\u001b[0m ${newState.member!.user.tag}`);
    }
}

export default event;