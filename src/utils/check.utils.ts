import {VoiceState} from "discord.js";
import {GuildService} from "@/services/guild.service";
import {VoiceChannelService} from "@/services/voiceChannel.service";

export async function checkUserDeafAndMute(newState: VoiceState) {
    const permMute = await GuildService.isPermanentlyMuted(newState.guild.id, newState.id);
    const permDeaf = await GuildService.isPermanentlyDeafed(newState.guild.id, newState.id);

    if (permMute || await VoiceChannelService.isMutedInChannel(newState.channelId!, newState.id)) {
        newState.setMute(true);
    }
    else {
        newState.setMute(false);
    }

    if (permDeaf || await VoiceChannelService.isDeafedInChannel(newState.channelId!, newState.id)) {
        newState.setDeaf(true);
    }
    else {
        newState.setDeaf(false);
    }
}

export async function checkIfChannelEmptyAndDelete(oldState: VoiceState) {
    if (! await VoiceChannelService.isPrivateChannel(oldState.channelId!)) {
        return;
    }

    if (oldState.channel?.members.size) {
        return;
    }

    await oldState.channel?.delete();
    await VoiceChannelService.deleteChannel(oldState.channelId!);
    return;
}