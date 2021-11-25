import { ClientEvents } from "discord.js";

type Run <K extends keyof ExtendedClientEvents> = (...args: ExtendedClientEvents[K]) => Promise<any>

interface ExtendedClientEvents extends ClientEvents {
    joinedVoice: [],
    leavedVoice: [],
    changedVoice: [],
    mutedInVoice: [],
    deafedInVoice: [],
    unMutedInVoice: [],
    unDeafedInVoice: []
}

export interface IEvent<K extends keyof ExtendedClientEvents> {
    name: K;
    once?: boolean;
    run: Run<K>;
}