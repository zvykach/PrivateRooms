import {IEvent} from "@/interfaces/IEvent";
import {GuildService} from "@/services/guild.service";
import {VoiceChannelService} from "@/services/voiceChannel.service";
import {VoiceState} from "discord.js";
import {VoiceChannelModel} from "@/models/voiceChannel.model";
import {IUser} from "@/interfaces/IUser";

const event: IEvent<"mutedInVoice"> = {
    name: "mutedInVoice",
    run: async (oldState: VoiceState, newState: VoiceState) => {
        const audit = await newState.guild.fetchAuditLogs({type:24, limit:1, user:newState.member!});
        const entry = audit.entries.first();

        if (!(entry && entry.executor)) {
            return;
        }

        const isMute = entry.changes?.find(change => change.key === 'mute' && change.new === true);

        if (!isMute) {
            return;
        }

        if (! await VoiceChannelService.isPrivateChannel(newState.channelId!)) {
            return;
        }

        if (await GuildService.isPermanentlyMuted(newState.guild.id, newState.id)) {
            return;
        }

        if (await VoiceChannelService.isChannelOwner(newState.channelId!, newState.id)) {
            await newState.setMute(false);
            return;
        }

        const toPush: IUser = {
            who: newState.id,
            by: entry.executor?.id
        }

        VoiceChannelModel.findOneAndUpdate({channelId: newState.channelId!},{ $push: toPush });
    }
}

export default event;