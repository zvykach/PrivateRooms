import {IEvent} from '@/interfaces/IEvent'
import {Message} from 'discord.js'
import {GuildService} from '@/services/guild.service';
import {checkCreationchannel, deleteMessage} from "@/utils/discord.utils";

const event: IEvent<"guildChatCommand"> = {
    name: "guildChatCommand",
    run: async (message: Message, prefix: string, command: string, ...args: string[]) => {
        if (!message.member?.permissions.has('ADMINISTRATOR')) return;
        if (command !== 'creationchannel') return;

        deleteMessage(message, 10000);
        if (args.length != 1) {
            const reply = await message.reply(`Please, use \` ${prefix}creationchannel <new prefix> \``);
            deleteMessage(reply, 10000);
            return;
        }

        const creationChannelId = args[0];

        const fetchedResult = await checkCreationchannel(message.guild!, creationChannelId);
        if (fetchedResult) {
            const reply = await message.reply(fetchedResult);
            deleteMessage(reply, 10000);
            return;
        }

        await GuildService.setGuildPrefix(message.guildId!, creationChannelId);
        const reply = await message.reply(`Creation channel id updated!`);
        deleteMessage(reply, 10000);
    }
}

export default event;
