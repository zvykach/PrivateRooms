import { Client, VoiceState } from "discord.js";
import { IEvent } from './interfaces/IEvent';
import config from '../config'
import mongoose from 'mongoose';
import fs from 'fs';

// import readline from 'readline';
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

class PrivateRooms {
    private readonly client: Client;

    constructor(client: Client) {
        this.client = client;
        mongoose.connect(config.MONGO_URI)
            .then(() => console.log("Connected Mongo"))
            .catch(err => console.error(err))

        this.loadEvents();
        this.bindCustom();
    }

    private async loadEvents() {
        const importedL: IEvent<any>[] = [];
        importedL.push((await import('./events/initMessage.event')).default);

        for (const imported of importedL) {
            if (imported.once) this.client.once(imported.name, imported.run);
            else this.client.on(imported.name, imported.run);
        }
    }

    private bindCustom() {
        this.client.on("voiceStateUpdate", (oldState: VoiceState, newState: VoiceState) => this.customVoiceState(oldState, newState))
    }

    private customVoiceState(oldState: VoiceState, newState: VoiceState) {
        // JoinedVoice
        if (!oldState.channel && newState.channel) {
            this.client.emit("joinedVoice");
            console.log("Joined");
            return;
        }
        // LeavedVoice
        if (oldState.channel && !newState.channel) {
            console.log("Leaved");
            return;
        }
        // ChangedVoice
        if (oldState.channel !== newState.channel) {
            console.log("Changed");
            return;
        }
        // MutedInVoice
        if (!oldState.serverMute && newState.serverMute) {
            console.log("Muted");
            return;
        }
        // UnMutedInVoice
        if (oldState.serverMute && !newState.serverMute) {
            console.log("UnMuted");
            return;
        }
        // DeafedInVoice
        if (!oldState.serverDeaf && newState.serverDeaf) {
            console.log("Deafed");
            return;
        }
        // UndeafedInVoice
        if (oldState.serverDeaf && !newState.serverDeaf) {
            console.log("unDeafed");
            return;
        }
    }
}

export default function (client: Client) {
    new PrivateRooms(client)
}