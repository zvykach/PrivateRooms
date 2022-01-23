import {Guild, Message} from "discord.js";

/**
 * Safe deleting target message in N seconds
 * @param message - Discord message object
 * @param time - Time before deleting the message in millis
 */
export function deleteMessage(message: Message, time: number) {
    setTimeout(() => message.delete().catch(() => {}), time);
}

/**
 * Check channel existing
 * @param guild - Guild to find
 * @param channelId - Creation channel id
 * @return {string | null} null - if no errors
 */
export async function checkCreationchannel(guild: Guild, channelId: string): Promise<string | null> {
    const fetchedChannel = await guild.channels.fetch(channelId).catch(() => {});
    if (!(fetchedChannel && fetchedChannel.isVoice())) {
        return "There is no voice channel with target id";
    }

    if (!fetchedChannel.parentId) {
        return "Channel is not in Category";
    }

    return null;
}

export async function checkAndGetGuildRole(guild: Guild, roleId: string) {
    return await guild.roles.fetch(roleId).catch(() => {});
}