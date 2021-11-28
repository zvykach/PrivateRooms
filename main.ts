import { Client } from 'discord.js'
import inf from '@/index'
import config from './config'

const client = new Client({intents: 32767 , partials: ["CHANNEL", "GUILD_MEMBER", "USER", "MESSAGE", "REACTION"]})

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`)
})

// console.log(require('bundle/out').default(client));

client.login(config.DS_TOKEN)
inf(client);