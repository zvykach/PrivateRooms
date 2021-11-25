import { IEvent } from '../interfaces/IEvent'
import { Message } from 'discord.js'

const event: IEvent<"messageCreate"> = {
    name: "messageCreate",
    run: async (message: Message) => {
        if (!message.content.startsWith("private#init ")) {
            return;
        }



        message.delete();
    }
}

export default event;
