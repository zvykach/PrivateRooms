import {IEvent} from '@/interfaces/IEvent'
import {Message} from 'discord.js'
import {deleteMessage} from "@/utils/discord.utils";
import {PrivateRooms} from "@/index";

const event: IEvent<"guildChatCommand"> = {
    name: "guildChatCommand",
    run: async (message: Message, prefix: string, command: string, ...args: string[]) => {
        if (!message.member?.permissions.has('ADMINISTRATOR')) return;
        if (command !== 'help') return;

        deleteMessage(message, 1);
        const botPrefix = PrivateRooms.instance.botCommandsPrefix;

        const reply = await message.reply(`
:pencil: All commands
\`${prefix}help\` - show all commands
\`${prefix}moderators add <roleID> ..[roleID]\` - add role to moderators list
\`${prefix}moderators remove <roleID> ..[roleID]\` - remove role from moderators list
\`${prefix}moderators clear\` - clear moderators list
\`${prefix}cooldown <time>\` - set room creation cooldown (in seconds)
\`${prefix}creationchannel <channelID>\` - change creationchannel for guild
\`${prefix}prefix <new prefix>\` - change bot prefix for guild
\`${botPrefix}prefix\` - show current prefix
\`${botPrefix}init <creationchannelID> [prefix] [cooldown]\` - initialize bot for guild
\`/mute <userID> [reason]\` - mute user
\`/deaf <userID> [reason]\` - deaf user
\`/unmute <userID>\` - unmute user
\`/undeaf <userID>\` - undeaf user`);
        deleteMessage(reply, 30000);
    }
}

export default event;
