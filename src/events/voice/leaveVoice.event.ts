import { IEvent } from '@/interfaces/IEvent'
import { VoiceState } from 'discord.js'
import { checkIfChannelEmptyAndDelete } from "@/utils/check.utils";

const event: IEvent<"leavedVoice"> = {
    name: "leavedVoice",
    run: async (oldState: VoiceState) => {
        await checkIfChannelEmptyAndDelete(oldState);
    }
}

export default event;