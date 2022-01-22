import { Client, VoiceState } from "discord.js";
import { IEvent } from './interfaces/IEvent';
import config from '../config'
import mongoose from 'mongoose';
import {GuildService} from "@/services/guild.service";

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
        importedL.push((await import('./events/sentInitMessage.event')).default);
        importedL.push((await import('./events/joinedPrivateRoomCreation.event')).default);
        importedL.push((await import('./events/joinVoice.event')).default);
        importedL.push((await import('./events/leaveVoice.event')).default);
        importedL.push((await import('./events/changedVoice.event')).default);
        importedL.push((await import('./events/mute.event')).default);
        importedL.push((await import('./events/unMute.event')).default);
        importedL.push((await import('./events/deaf.event')).default);
        importedL.push((await import('./events/unDeaf.event')).default);

        for (const imported of importedL) {
            if (imported.once) this.client.once(imported.name, imported.run);
            else this.client.on(imported.name, imported.run);
        }
    }

    private bindCustom() {
        this.client.on("voiceStateUpdate", (oldState: VoiceState, newState: VoiceState) => this.customVoiceState(oldState, newState))
    }

    private async customVoiceState(oldState: VoiceState, newState: VoiceState) {
        // Joined "CreatePrivateRoom" channel
        if (newState.channelId && newState.channelId != oldState.channelId && await GuildService.isCreatePrivateChannel(newState.guild.id, newState.channelId)) {
            this.client.emit("joinedPrivateRoomCreation", oldState, newState);
            console.log("joinedPrivateRoomCreation");
            return;
        }
        // JoinedVoice
        if (!oldState.channel && newState.channel) {
            this.client.emit("joinedVoice", newState);
            console.log("Joined");
            return;
        }
        // LeavedVoice
        if (oldState.channel && !newState.channel) {
            this.client.emit("leavedVoice", oldState);
            console.log("Leaved");
            return;
        }
        // ChangedVoice
        if (oldState.channelId !== newState.channelId) {
            this.client.emit("changedVoice", oldState, newState);
            console.log("Changed");
            return;
        }
        // MutedInVoice
        if (!oldState.serverMute && newState.serverMute) {
            this.client.emit("mutedInVoice", oldState, newState);
            console.log("Muted");
            return;
        }
        // UnMutedInVoice
        if (oldState.serverMute && !newState.serverMute) {
            this.client.emit("unMutedInVoice", oldState, newState);
            console.log("UnMuted");
            return;
        }
        // DeafedInVoice
        if (!oldState.serverDeaf && newState.serverDeaf) {
            this.client.emit("deafedInVoice", oldState, newState);
            console.log("Deafed");
            return;
        }
        // UndeafedInVoice
        if (oldState.serverDeaf && !newState.serverDeaf) {
            this.client.emit("unDeafedInVoice", oldState, newState);
            console.log("unDeafed");
            return;
        }
    }
}

export default function (client: Client) {
    new PrivateRooms(client)
}