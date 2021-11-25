import { IEvent } from '../interfaces/IEvent'
import {Message} from 'discord.js'
import {GuildService} from "@/services/guild.service";

const event: IEvent<"messageCreate"> = {
    name: "messageCreate",
    run: async (message: Message) => {
        if (!message.inGuild()) {
            return;
        }

        if (!message.content.startsWith("private#init ")) {
            return;
        }

        const [command, id, cooldown] = message.content.split(' ');
        await message.delete();

        await GuildService.addNewGuild(message.guildId!, id);
    }
}

export default event;
