import { IEvent } from '@/interfaces/IEvent'
import { VoiceState } from 'discord.js'
import { checkUserDeafAndMute } from "@/utils/check.utils";

const event: IEvent<"joinedVoice"> = {
    name: "joinedVoice",
    run: async (newState: VoiceState) => {
        await checkUserDeafAndMute(newState);
    }
}

export default event;