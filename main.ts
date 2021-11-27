import { Client } from 'discord.js'
import inf from '@/index'
import config from './config'

const client = new Client({intents: 32767 , partials: ["CHANNEL"]})

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`)
})

client.login(config.DS_TOKEN)
inf(client);