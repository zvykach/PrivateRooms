import {IEvent} from "@/interfaces/IEvent";
import {GuildService} from "@/services/guild.service";
import {VoiceChannelService} from "@/services/voiceChannel.service";
import {VoiceState} from "discord.js";

const event: IEvent<"mutedInVoice"> = {
    name: "mutedInVoice",
    run: async (oldState: VoiceState, newState: VoiceState) => {
        if (await GuildService.isPermanentlyMuted(newState.guild.id, newState.id)) {
            return;
        }

        if (! await VoiceChannelService.isPrivateChannel(newState.channelId!)) {
            return;
        }

        const audit = await newState.guild.fetchAuditLogs({type:24, limit:1});
        const entry = audit.entries.first();

        if (!(entry && entry.executor && entry.target)) {
            return;
        }

        const isMute = entry.changes?.find(change => change.key === 'mute' && change.new === true);

        if (!isMute) {
            return;
        }

        if (await VoiceChannelService.isChannelOwner(newState.channelId!, newState.id)) {
            await newState.setMute(false);
            return;
        }

        await VoiceChannelService.addMutedInChannel(newState.channelId!, newState.id, entry.executor?.id);
    }
}

export default event;