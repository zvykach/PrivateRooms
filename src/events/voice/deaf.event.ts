import {IEvent} from "@/interfaces/IEvent";
import {GuildService} from "@/services/guild.service";
import {VoiceChannelService} from "@/services/voiceChannel.service";
import {VoiceState} from "discord.js";

const event: IEvent<"deafedInVoice"> = {
    name: "deafedInVoice",
    run: async (oldState: VoiceState, newState: VoiceState) => {
        if (await GuildService.isPermanentlyDeafed(newState.guild.id, newState.id)) {
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

        const isDeaf = entry.changes?.find(change => change.key === 'deaf' && change.new === true);

        if (!isDeaf) {
            return;
        }

        if (await VoiceChannelService.isChannelOwner(newState.channelId!, newState.id)) {
            await newState.setDeaf(false);
            return;
        }

        await VoiceChannelService.addDeafedInChannel(newState.channelId!, newState.id, entry.executor?.id);
    }
}

export default event;