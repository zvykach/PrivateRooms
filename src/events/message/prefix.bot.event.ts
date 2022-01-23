import {IEvent} from '@/interfaces/IEvent'
import {Message} from 'discord.js'
import {GuildService} from '@/services/guild.service';
import {deleteMessage} from "@/utils/discord.utils";
import {PrivateRooms} from "@/index";

const event: IEvent<"messageCreate"> = {
    name: "messageCreate",
    run: async (message: Message) => {
        if (!message.inGuild()) {
            return;
        }

        const [command, ...extra] = message.content.replace(/\s+/g,' ').trim().split(' ');

        if (command !== PrivateRooms.instance.botCommandsPrefix+'prefix') {
            return;
        }

        deleteMessage(message, 10000);

        const prefix = await GuildService.getGuildPrefix(message.guildId!);

        if (!prefix) {
            const reply = await message.reply("Guild has not initialized");
            deleteMessage(reply, 10000);
            return;
        }

        const reply = await message.reply(`Guild prefix: ${prefix}`);
        deleteMessage(reply, 10000);
    }
}

export default event;
