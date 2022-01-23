import { Client } from 'discord.js'
import privateRooms from '@/index'
import config from './config'

const client = new Client({intents: 32767 , partials: ["CHANNEL", "GUILD_MEMBER", "USER", "MESSAGE", "REACTION"]})

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`)
})

privateRooms(client, { mongoURI: config.MONGO_URI });
client.login(config.DS_TOKEN)