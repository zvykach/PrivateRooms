import {IEvent} from '../interfaces/IEvent'
import {Message} from 'discord.js'
import {GuildService} from '../services/guild.service';

const event: IEvent<"messageCreate"> = {
    name: "messageCreate",
    run: async (message: Message) => {
        if (!message.inGuild()) {
            return;
        }

        if (!message.member?.permissions.has('ADMINISTRATOR')) {
            return;
        }

        const [command, id, ...args] = message.content.split(' ');

        if (command !== 'private#init') {
            return;
        }

        if (await GuildService.guildExits(message.guildId!)) {
            return;
        }

        setTimeout(() => message.delete(), 7000);

        if (args.length != 0) {
            const reply = await message.reply("Too much arguments! Enter only *Creation channel id*");
            setTimeout(() => reply.delete(), 10000);
            return;
        }

        const isChannelReal = message.member!.guild.channels.cache.find(channel => channel.id === id && channel.isVoice());
        if (!isChannelReal) {
            const reply = await message.reply("There is no voice channel with that id");
            setTimeout(() => reply.delete(),10000);
            return;
        }

        const reply = await message.reply("Initial settings saved!");
        setTimeout(() => reply.delete(),10000);

        await GuildService.addNewGuild(message.guildId!, id);
    }
}

export default event;
