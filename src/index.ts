import {Client, Interaction, Message, VoiceState} from "discord.js";
import { IEvent } from './interfaces/IEvent';
import mongoose from 'mongoose';
import {GuildService} from "@/services/guild.service";
import {IChatInputApplicationInteraction} from "@/interfaces/IApplicationInteraction";

export class PrivateRooms {
    public static instance: PrivateRooms;

    private readonly client: Client;
    private readonly slashInteractions: Map<string, IChatInputApplicationInteraction> = new Map();

    public readonly consoleLogsLabel: string = "\u001b[46m\u001b[37mPRooms\u001b[0m ";
    public readonly botCommandsPrefix: string = "pr#";
    public readonly minCooldownTime: number = 20;
    public readonly maxCooldownTime: number = 360;

    constructor(client: Client, options?: PrivateRoomsOptions) {
        this.client = client;

        if (!options?.mongoURI && mongoose.connection.readyState !== 1) {
            throw new Error(this.consoleLogsLabel + "mongoURI not specified or mongo has not started before");
        } else {
            mongoose.connect(options!.mongoURI!)
                .then(() => console.log(this.consoleLogsLabel + "Mongo connected"))
                .catch(err => {
                    console.error(err);
                    throw new Error(this.consoleLogsLabel + "Mongo connection error")
                })
        }

        if (options?.minCooldownTime) this.minCooldownTime = options.minCooldownTime;
        if (options?.maxCooldownTime) this.maxCooldownTime = options.maxCooldownTime;
        if (options?.consoleLogsLabel) this.consoleLogsLabel = options.consoleLogsLabel;
        if (options?.botCommandsPrefix) this.botCommandsPrefix = options.botCommandsPrefix;

        PrivateRooms.instance = this;

        this.loadEvents();
        this.bindCustom();

        this.client.on("ready", () => {
            this.loadInteractions();
        })
    }

    private async loadInteractions() {
        const importedL: IChatInputApplicationInteraction[] = [];
        importedL.push((await import('./interactions/mute.command')).default);
        importedL.push((await import('./interactions/unmute.command')).default);
        importedL.push((await import('./interactions/deaf.command')).default);
        importedL.push((await import('./interactions/undeaf.command')).default);

        for (const imported of importedL) {
            if (imported.permissions) imported.defaultPermission = false;
            this.slashInteractions.set(imported.name, imported);
        }

        const guild = await this.client.guilds.fetch("686257819913158659");
        await guild.commands.set(importedL).catch(console.error);
    }

    private async loadEvents() {
        const importedL: IEvent<any>[] = [];
        importedL.push((await import('./events/voice/joinedPrivateRoomCreation.event')).default);
        importedL.push((await import('./events/voice/joinVoice.event')).default);
        importedL.push((await import('./events/voice/leaveVoice.event')).default);
        importedL.push((await import('./events/voice/changedVoice.event')).default);
        importedL.push((await import('./events/voice/mute.event')).default);
        importedL.push((await import('./events/voice/unMute.event')).default);
        importedL.push((await import('./events/voice/deaf.event')).default);
        importedL.push((await import('./events/voice/unDeaf.event')).default);

        importedL.push((await import('./events/message/init.bot.event')).default);
        importedL.push((await import('./events/message/prefix.bot.event')).default);
        importedL.push((await import('./events/message/prefix.change.event')).default);
        importedL.push((await import('./events/message/creationchannel.change.event')).default);
        importedL.push((await import('./events/message/moderators.event')).default);
        importedL.push((await import('./events/message/cooldown.change.event')).default);
        importedL.push((await import('./events/message/help.event')).default);

        for (const imported of importedL) {
            if (imported.once) this.client.once(imported.name, imported.run);
            else this.client.on(imported.name, imported.run);
        }
    }

    private bindCustom() {
        this.client.on("voiceStateUpdate", (oldState, newState) => this.customVoiceState(oldState, newState));
        this.client.on("messageCreate", (message) => this.guildChatCommandsHandler(message));
        this.client.on("interactionCreate", (interaction) => this.guildInteractionCommandHendler(interaction))
    }

    private async guildChatCommandsHandler(message: Message) {
        if (!message.inGuild()) return;

        const guildPrefix = await GuildService.getGuildPrefix(message.guildId!);
        if (!guildPrefix) return;

        const [commandAll, ...args] = message.content.replace(/\s+/g,' ').trim().split(' ');

        if (!commandAll.startsWith(guildPrefix)) return;
        const command = commandAll.slice(guildPrefix.length);

        this.client.emit("guildChatCommand", message, guildPrefix, command, ...args);
    }

    private async guildInteractionCommandHendler(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        const command = this.slashInteractions.get(interaction.commandName);
        if (!command) return;

        await command.run(interaction);
    }

    private async customVoiceState(oldState: VoiceState, newState: VoiceState) {
        // Joined "CreatePrivateRoom" channel
        if (newState.channelId && newState.channelId != oldState.channelId && await GuildService.isCreatePrivateChannel(newState.guild.id, newState.channelId)) {
            this.client.emit("joinedPrivateRoomCreation", oldState, newState);
            // console.log("joinedPrivateRoomCreation");
            return;
        }
        // JoinedVoice
        if (!oldState.channel && newState.channel) {
            this.client.emit("joinedVoice", newState);
            // console.log("Joined");
            return;
        }
        // LeavedVoice
        if (oldState.channel && !newState.channel) {
            this.client.emit("leavedVoice", oldState);
            // console.log("Leaved");
            return;
        }
        // ChangedVoice
        if (oldState.channelId !== newState.channelId) {
            this.client.emit("changedVoice", oldState, newState);
            // console.log("Changed");
            return;
        }
        // MutedInVoice
        if (!oldState.serverMute && newState.serverMute) {
            this.client.emit("mutedInVoice", oldState, newState);
            // console.log("Muted");
            return;
        }
        // UnMutedInVoice
        if (oldState.serverMute && !newState.serverMute) {
            this.client.emit("unMutedInVoice", oldState, newState);
            // console.log("UnMuted");
            return;
        }
        // DeafedInVoice
        if (!oldState.serverDeaf && newState.serverDeaf) {
            this.client.emit("deafedInVoice", oldState, newState);
            // console.log("Deafed");
            return;
        }
        // UndeafedInVoice
        if (oldState.serverDeaf && !newState.serverDeaf) {
            this.client.emit("unDeafedInVoice", oldState, newState);
            // console.log("unDeafed");
            return;
        }
    }
}

export default function (client: Client, options?: PrivateRoomsOptions) {
    if (PrivateRooms.instance) throw new Error(PrivateRooms.instance.consoleLogsLabel + "Instance already created");
    new PrivateRooms(client, options);
}

export interface PrivateRoomsOptions {
    mongoURI?: string | undefined,
    minCooldownTime?: number | undefined,
    maxCooldownTime?: number | undefined,
    consoleLogsLabel?: string | undefined,
    botCommandsPrefix?: string | undefined
}