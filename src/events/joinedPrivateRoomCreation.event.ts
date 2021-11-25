import {IEvent} from '../interfaces/IEvent'
import {Permissions, VoiceState} from 'discord.js'
import {GuildService} from "@/services/guild.service";
import {channelCreationError, cooldownTime} from "@/utils/embeds.util";
import {ChannelTypes} from "discord.js/typings/enums";
import {VoiceChannelService} from "@/services/voiceChannel.service";
import {checkIfChannelEmptyAndDelete} from "@/utils/check.utils";

const creationCooldown = new Map<string, number>();

const event: IEvent<"joinedPrivateRoomCreation"> = {
    name: "joinedPrivateRoomCreation",
    run: async (oldState: VoiceState, newState: VoiceState) => {
        if (oldState.channelId) {
            await checkIfChannelEmptyAndDelete(oldState);
        }

        const cooldownKey = `${newState.guild.id}:${newState.id}`;
        if (creationCooldown.has(cooldownKey)) {
            const cooldown = await GuildService.getCooldownTime(newState.guild.id);

            if (!cooldown) {
                await newState.member?.send({embeds:[channelCreationError]});
                await newState.disconnect("Error");
                return;
            }

            const time = creationCooldown.get(cooldownKey)! + cooldown * 1000;
            const now = Date.now();

            if ( time > now) {
                await newState.member?.send({embeds:[cooldownTime(((time - now) / 1000).toString())]});
                await newState.disconnect("Cooldown");
                return;
            }
        }

        creationCooldown.set(cooldownKey, Date.now());
        const createPrivateRoomChannelId = await GuildService.getCreatePrivateChannelId(newState.guild.id);
        if (!createPrivateRoomChannelId) {
            await newState.member?.send({embeds:[channelCreationError]});
            return;
        }

        const parentId = newState.guild.channels.cache.find(channel => channel.id === createPrivateRoomChannelId)?.parentId
        if (!parentId) {
            await newState.member?.send({embeds:[channelCreationError]});
            return;
        }

        const name = newState.member?.nickname
            ?? newState.member?.user.username
            ?? 'Someone';

        const channel = await newState.guild.channels.create(name+'\'s channel', {
            type: ChannelTypes.GUILD_VOICE,
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