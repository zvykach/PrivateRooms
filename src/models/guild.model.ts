import { Schema, model } from "mongoose";
import { IUser, UserSchemaInner } from '../interfaces/IUser';

const ggg = {
    who: { type: String, required: true },
    by: { type: String, required: true },
    reason: { type: String, default: "No reason"},
    time: { type: Date, default: Date.now }
}

export interface IGuild {
    guildId: string
    moderatorRoleIds: string[]
    prefix: string
    createPrivateChannelId: string
    permanentlyMuted: IUser[],
    permanentlyDeafed: IUser[]
}

const schema = new Schema<IGuild>({
    guildId: { type: String, required: true },
    moderatorRoleIds: [{ type: String, required: true }],
    prefix: { type: String, required: false },
    createPrivateChannelId: { type: String, required: false },
    permanentlyMuted: [{ type: UserSchemaInner, required: false}],
    permanentlyDeafed: [{ type: UserSchemaInner, required: false}]

});

export const GuildModel = model<IGuild>('Guild', schema);
