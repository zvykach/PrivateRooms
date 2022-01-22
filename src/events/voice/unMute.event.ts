import {IEvent} from "@/interfaces/IEvent";
import {GuildService} from "@/services/guild.service";
import {VoiceChannelService} from "@/services/voiceChannel.service";
import {VoiceState} from "discord.js";

const event: IEvent<"unMutedInVoice"> = {
    name: "unMutedInVoice",
    run: async (oldState: VoiceState, newState: VoiceState) => {
        if (await GuildService.isPermanentlyMuted(newState.guild.id, newState.id)) {
            await newState.setMute(true);
            return;
        }

        if (! await VoiceChannelService.isPrivateChannel(newState.channelId!)) {
            return;
        }

        const audit = await newState.guild.fetchAuditLogs({type:24, limit:1});
        const entry = audit.entries.first();

        if (!(entry && entry.executor)) {
            return;
        }

        const isMute = entry.changes?.find(change => change.key === 'mute' && change.new === false);

        if (!isMute) {
            return;
        }

        await VoiceChannelService.removeMutedInChannel(newState.channelId!, newState.id);
    }
}

export default event;