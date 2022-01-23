import {IEvent} from '@/interfaces/IEvent'
import {Message} from 'discord.js'
import {GuildService} from '@/services/guild.service';
import {deleteMessage} from "@/utils/discord.utils";
import {PrivateRooms} from "@/index";

const event: IEvent<"guildChatCommand"> = {
    name: "guildChatCommand",
    run: async (message: Message, prefix: string, command: string, ...args: string[]) => {
        if (!message.member?.permissions.has('ADMINISTRATOR')) return;
        if (command !== 'cooldown') return;

        deleteMessage(message, 10000);
        if (args.length != 1) {
            const reply = await message.reply(`Please, use \` ${prefix}cooldown <new cooldown in sec> \``);
            deleteMessage(reply, 10000);
            return;
        }

        const cooldown = args[0];

        if (!(+cooldown >= PrivateRooms.instance.minCooldownTime)) {
            const reply = await message.reply(`Cooldown is less than minimal (${PrivateRooms.instance.minCooldownTime})`);
            deleteMessage(reply, 10000);
            return;
        }

        if (!(+cooldown <= PrivateRooms.instance.maxCooldownTime)) {
            const reply = await message.reply(`Cooldown is more than maximum (${PrivateRooms.instance.maxCooldownTime})`);
            deleteMessage(reply, 10000);
            return;
        }

        await GuildService.setCooldown(message.guildId!, +cooldown);
        const reply = await message.reply(`Cooldown updated!`);
        deleteMessage(reply, 10000);
    }
}

export default event;
