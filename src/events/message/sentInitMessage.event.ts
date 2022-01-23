import {IEvent} from '@/interfaces/IEvent'
import {Message} from 'discord.js'
import {GuildService} from '@/services/guild.service';
import config from "../../../config";
import {checkCreationchannel, deleteMessage} from "@/utils/discord.utils";

const MINIMUM_COOLDOWN = config.MINIMUM_COOLDOWN;
const MAXIMUM_COOLDOWN = config.MAXIMUM_COOLDOWN;

const event: IEvent<"messageCreate"> = {
    name: "messageCreate",
    run: async (message: Message) => {
        if (!message.inGuild()) {
            return;
        }

        if (!message.member?.permissions.has('ADMINISTRATOR')) {
            return;
        }

        const [command, creationChannelId, prefix, cooldown, ...extra] = message.content.replace(/\s+/g,' ').trim().split(' ');

        if (command !== 'private#init') {
            return;
        }

        if (await GuildService.guildExits(message.guildId!)) {
            const reply = await message.reply("Guild has been already initialized");
            deleteMessage(reply, 10000);
            return;
        }

        deleteMessage(message, 7000);

        if (!creationChannelId) {
            const reply = await message.reply("Please, use \` private#init <ChannelId> [prefix] [cooldown (sec)] \`");
            deleteMessage(reply, 10000);
            return;
        }

        if (extra.length > 0) {
            const reply = await message.reply("Too much arguments!");
            deleteMessage(reply, 10000);
            return;
        }

        const fetchedResult = await checkCreationchannel(message.guild!, creationChannelId);
        if (fetchedResult) {
            const reply = await message.reply(fetchedResult);
            deleteMessage(reply, 10000);
            return;
        }


        if (!(+cooldown >= MINIMUM_COOLDOWN)) {
            const reply = await message.reply(`Cooldown is less than minimal (${MINIMUM_COOLDOWN})`);
            deleteMessage(reply, 10000);
            return;
        }

        if (!(+cooldown <= MAXIMUM_COOLDOWN)) {
            const reply = await message.reply(`Cooldown is more than maximum (${MAXIMUM_COOLDOWN})`);
            deleteMessage(reply, 10000);
            return;
        }

        const createdGuild = await GuildService.addNewGuild(message.guildId!, creationChannelId, prefix, +cooldown);
        const reply = await message.reply(`Initial settings saved! CD: ${createdGuild.cooldown} P: ${createdGuild.prefix}`);
        deleteMessage(reply, 10000);
    }
}

export default event;
