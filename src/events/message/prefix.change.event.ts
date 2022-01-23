import {IEvent} from '@/interfaces/IEvent'
import {Message} from 'discord.js'
import {GuildService} from '@/services/guild.service';
import {deleteMessage} from "@/utils/discord.utils";

const event: IEvent<"guildChatCommand"> = {
    name: "guildChatCommand",
    run: async (message: Message, prefix: string, command: string, ...args: string[]) => {
        if (!message.member?.permissions.has('ADMINISTRATOR')) return;
        if (command !== 'prefix') return;

        deleteMessage(message, 10000);
        if (args.length != 1) {
            const reply = await message.reply(`Please, use \` ${prefix}prefix <new prefix> \``);
            deleteMessage(reply, 10000);
            return;
        }

        await GuildService.setGuildPrefix(message.guildId!, args[0]);
        const reply = await message.reply(`Prefix updated!`);
        deleteMessage(reply, 10000);
    }
}

export default event;
