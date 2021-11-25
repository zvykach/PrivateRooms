import { VoiceChannelModel, IVoiceChannel } from '../models/voiceChannel.model';
import { Document, Types } from 'mongoose';

export type TVoiceChannelResponse = (Document<any, any, IVoiceChannel> & IVoiceChannel & {_id: Types.ObjectId}) | null;

export class VoiceChannelService {
    public static async isPrivateChannel(channelId: string): Promise<boolean> {
        return !! await VoiceChannelModel.findOne({ channelId });
    }

    public static async isChannelOwner(channelId: string, userId: string): Promise<boolean> {
        return !! await VoiceChannelModel.findOne({ channelId, ownerId: userId });
    }

    public static async isMutedInChannel(channelId: string, userId: string): Promise<boolean> {
        return !! await VoiceChannelModel.findOne({ channelId, 'mutedUsers.who': userId });
    }

    public static async isDeafedInChannel(channelId: string, userId: string): Promise<boolean> {
        return !! await VoiceChannelModel.findOne({ channelId, 'deafedUsers.who': userId });
    }

    public static async addNewChannel(channelId: string, ownerId: string) {
        await VoiceChannelModel.create({
            channelId,
            ownerId
        })
    }

    public static async deleteChannel(channelId: string) {
        await VoiceChannelModel.findOneAndDelete({ channelId });
    }
}