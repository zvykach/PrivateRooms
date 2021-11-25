import { Schema, model } from "mongoose";
import { IUser, UserSchemaInner } from '../interfaces/IUser';

export interface IVoiceChannel {
    channelId: string
    //guild: Types.ObjectId
    ownerId: string
    mutedUsers: IUser[]
    deafedUsers: IUser[]
}

const schema = new Schema<IVoiceChannel>({
    channelId: {type: String, required: true},
    //guild: { type: Types.ObjectId, ref: 'User' },
    ownerId: {type: String, required: true },
    mutedUsers: [{ type: UserSchemaInner, required: false}],
    deafedUsers: [{ type: UserSchemaInner, required: false}]
});

export const VoiceChannelModel = model<IVoiceChannel>('VoiceChannel', schema);