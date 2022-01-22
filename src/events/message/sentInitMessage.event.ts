import {IEvent} from '@/interfaces/IEvent'
import {Message} from 'discord.js'
import {GuildService} from '@/services/guild.service';
import config from "../../../config";

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
            setTimeout(() => reply.delete().catch(() => {}), 10000);
            return;
        }

        setTimeout(() => message.delete().catch(() => {}), 7000);

        if (!creationChannelId) {
            const reply = await message.reply("Please, use \` private#init <ChannelId> [prefix] [cooldown (sec)] \`");
            setTimeout(() => reply.delete().catch(() => {}), 10000);
            return;
        }

        if (extra.length > 0) {
            const reply = await message.reply("Too much arguments!");
            setTimeout(() => reply.delete().catch(() => {}), 10000);
            return;
        }

        const fetchedChannel = await message.channel.guild.channels.fetch(creationChannelId).catch(() => {});
        if (!(fetchedChannel && fetchedChannel.isVoice())) {
            const reply = await message.reply("There is no voice channel with target id");
            setTimeout(() => reply.delete().catch(() => {}),10000);
            return;
        }

        if (!(+cooldown >= MINIMUM_COOLDOWN)) {
            const reply = await message.reply(`Cooldown is less than minimal (${MINIMUM_COOLDOWN})`);
            setTimeout(() => reply.delete().catch(() => {}),10000);
            return;
        }

        if (!(+cooldown <= MAXIMUM_COOLDOWN)) {
            const reply = await message.reply(`Cooldown is more than maximum (${MAXIMUM_COOLDOWN})`);
            setTimeout(() => reply.delete().catch(() => {}),10000);
            return;
        }

        const createdGuild = await GuildService.addNewGuild(message.guildId!, creationChannelId, prefix, +cooldown);
        const reply = await message.reply(`Initial settings saved! CD: ${createdGuild.cooldown} P: ${createdGuild.prefix}`);
        setTimeout(() => reply.delete().catch(),10000);
    }
}

export default event;
