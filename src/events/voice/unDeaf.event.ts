import {IEvent} from "@/interfaces/IEvent";
import {GuildService} from "@/services/guild.service";
import {VoiceChannelService} from "@/services/voiceChannel.service";
import {VoiceState} from "discord.js";

const event: IEvent<"unDeafedInVoice"> = {
    name: "unDeafedInVoice",
    run: async (oldState: VoiceState, newState: VoiceState) => {
        if (await GuildService.isPermanentlyDeafed(newState.guild.id, newState.id)) {
            await newState.setDeaf(true);
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

        const isDeaf = entry.changes?.find(change => change.key === 'deaf' && change.new === false);

        if (!isDeaf) {
            return;
        }

        await VoiceChannelService.removeDeafedInChannel(newState.channelId!, newState.id);
    }
}

export default event;