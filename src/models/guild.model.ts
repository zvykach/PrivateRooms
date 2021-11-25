import { Schema, model } from "mongoose";
import { IUser, UserSchemaInner } from '../interfaces/IUser';

export interface IGuild {
    guildId: string
    moderatorRoleIds: string[]
    prefix: string
    cooldown: number
    createPrivateChannelId: string
    permanentlyMuted: IUser[],
    permanentlyDeafed: IUser[]
}

const schema = new Schema<IGuild>({
    guildId: { type: String, required: true },
    moderatorRoleIds: [{ type: String, required: false }],
    prefix: { type: String, required: true, default: "$" },
    cooldown: { type: Number, required: true, default: 20},
    createPrivateChannelId: { type: String, required: false },
    permanentlyMuted: [{ type: UserSchemaInner, required: false}],
    permanentlyDeafed: [{ type: UserSchemaInner, required: false}]
});

export const GuildModel = model<IGuild>('Guild', schema);
