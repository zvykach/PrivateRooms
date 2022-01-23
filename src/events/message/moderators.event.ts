import {IEvent} from '@/interfaces/IEvent'
import {Message} from 'discord.js'
import {GuildService} from '@/services/guild.service';
import {checkAndGetGuildRole, deleteMessage} from "@/utils/discord.utils";

const event: IEvent<"guildChatCommand"> = {
    name: "guildChatCommand",
    run: async (message: Message, prefix: string, command: string, ...args: string[]) => {
        if (!message.member?.permissions.has('ADMINISTRATOR')) return;
        if (command !== 'moderators') return;

        deleteMessage(message, 10000);

        if (args.length < 1 || args.length > 11 || !['add', 'remove', 'clear'].includes(args[0])) {
            const reply = await message.reply(`Please, use \` ${prefix}moderators <add|remove|clear> [roleId ..10] \``);
            deleteMessage(reply, 10000);
            return;
        }

        if (args[0] === 'clear') {
            await GuildService.clearGuildModerator(message.guildId!);
            const reply = await message.reply(`Guild moderators list has been cleared`);
            deleteMessage(reply, 10000);
            return;
        }

        const roles = await checkRoles(message, ...args);
        if (roles.length == 0) {
            const reply = await message.reply(`No real roleIds entered!`);
            deleteMessage(reply, 10000);
            return;
        }

        if (args[0] === 'add') {
            await GuildService.addGuildModerator(message.guildId!, ...roles);
            const reply = await message.reply(`Roles added to moderators list! Added {${roles.length}/${args.length - 1}}\n${roles}`);
            deleteMessage(reply, 60000);
            return;
        }

        if (args[0] === 'remove') {
            await GuildService.removeGuildModerator(message.guildId!, ...roles);
            const reply = await message.reply(`Roles removed from moderators list! Removed {${roles.length}/${args.length - 1}}\n${roles}`);
            deleteMessage(reply, 60000);
            return;
        }
    }
}

export default event;

async function checkRoles(message: Message, ...args: string[]): Promise<string[]> {
    const roles: string[] = [];

    for (let i = 1; i < args.length; i++ ) {
        const role = await checkAndGetGuildRole(message.guild!, args[i]);
        if (!role) continue;

        roles.push(args[i]);
    }

    return roles;
}
