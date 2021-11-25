import { GuildModel, IGuild } from '../models/guild.model';
import { Document, Types } from 'mongoose';

export type TGuildResponse = (Document<any, any, IGuild> & IGuild & {_id: Types.ObjectId}) | null;

export class GuildService {
    public static async isCreatePrivateChannel(guildId: string, channelId: string): Promise<boolean> {
        const channel = await GuildModel.findOne({guildId, createPrivateChannelId: channelId});

        return !!channel;
    }

    public static async isGuildPrefix(guildId: string, prefix: string): Promise<boolean> {
        const resp = await GuildModel.findOne({guildId, prefix});

        return !!resp;
    }

    public static async isGuildModerator(guildId: string, roleId: string): Promise<boolean> {
        const resp = await GuildModel.findOne({guildId});

        return resp ? resp.moderatorRoleIds.includes(roleId) : false;
    }

    public static async isPermanentlyMuted(guildId: string, userId: string) {
        const resp = await GuildModel.findOne({ guildId, 'permanentlyMuted.who': userId });
        console.log(resp);
        return !!resp;
    }

    public static async isPermanentlyDeafed(guildId: string, userId: string) {
        const resp = await GuildModel.findOne({ guildId, 'permanentlyDeafed.who': userId });

        return !!resp;
    }
}