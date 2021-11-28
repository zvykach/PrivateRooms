import { GuildModel, IGuild } from '../models/guild.model';
import { Document, Types } from 'mongoose';

export type TGuildResponse = (Document<any, any, IGuild> & IGuild & {_id: Types.ObjectId}) | null;

export class GuildService {
    public static async isCreatePrivateChannel(guildId: string, channelId: string): Promise<boolean> {
        return !! await GuildModel.findOne({guildId, createPrivateChannelId: channelId});
    }

    public static async getCreatePrivateChannelId(guildId: string): Promise<undefined | string> {
        const resp = await GuildModel.findOne({guildId});

        return resp?.createPrivateChannelId;
    }

    public static async isGuildPrefix(guildId: string, prefix: string): Promise<boolean> {
        const resp = await GuildModel.findOne({guildId, prefix});

        return !!resp;
    }

    public static async getCooldownTime(guildId: string) {
        const resp = await GuildModel.findOne({guildId});
        return resp?.cooldown;
    }

    public static async isGuildModerator(guildId: string, roleId: string): Promise<boolean> {
        const resp = await GuildModel.findOne({guildId});

        return resp ? resp.moderatorRoleIds.includes(roleId) : false;
    }

    public static async isPermanentlyMuted(guildId: string, userId: string) {
        const resp = await GuildModel.findOne({ guildId, 'permanentlyMuted.who': userId });

        return !!resp;
    }

    public static async isPermanentlyDeafed(guildId: string, userId: string) {
        const resp = await GuildModel.findOne({ guildId, 'permanentlyDeafed.who': userId });

        return !!resp;
    }

    public static async addNewGuild(guildId: string, createPrivateChannelId: string) {
        await GuildModel.create({
            guildId,
            createPrivateChannelId
        })
    }

    public static async guildExits(guildId: string) {
        return !! await GuildModel.findOne({guildId});
    }
}