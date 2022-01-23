import {ClientEvents, Message, VoiceState} from "discord.js";

type Run <K extends keyof ExtendedClientEvents> = (...args: ExtendedClientEvents[K]) => Promise<any>

interface ExtendedClientEvents extends ClientEvents {
    joinedPrivateRoomCreation: [oldState: VoiceState, newState: VoiceState]
    joinedVoice: [newState: VoiceState]
    leavedVoice: [oldState: VoiceState]
    changedVoice: [oldState: VoiceState, newState: VoiceState]
    mutedInVoice: [oldState: VoiceState, newState: VoiceState]
    deafedInVoice: [oldState: VoiceState, newState: VoiceState]
    unMutedInVoice: [oldState: VoiceState, newState: VoiceState]
    unDeafedInVoice: [oldState: VoiceState, newState: VoiceState]
    guildChatCommand: [message: Message, prefix: string, command: string, ...args: string[]]
}

export interface IEvent<K extends keyof ExtendedClientEvents> {
    name: K
    once?: boolean
    run: Run<K>
}