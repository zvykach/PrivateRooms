import {MessageEmbed} from "discord.js";

export const channelCreationError = new MessageEmbed()
    .setDescription('Error')
    .setColor('#ff0f53')

export const cooldownTime = (message: string) => new MessageEmbed()
    .setDescription(`Time remaining: ${message} s.`)
    .setColor('#ff0f53')