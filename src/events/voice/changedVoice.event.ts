import {IEvent} from "@/interfaces/IEvent";
import {VoiceState} from "discord.js";
import {checkIfChannelEmptyAndDelete, checkUserDeafAndMute} from "@/utils/check.utils";

const event: IEvent<"changedVoice"> = {
    name: "changedVoice",
    run: async (oldState: VoiceState, newState: VoiceState) => {
        await checkUserDeafAndMute(newState);
        await checkIfChannelEmptyAndDelete(oldState);
    }
}

export default event;