import { GuildModel, IGuild } from '@/models/guild.model';
import { Document, Types } from 'mongoose';
import {IUser} from "@/interfaces/IUser";

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

    public static async getGuildPrefix(guildId: string) {
        const resp = await GuildModel.findOne({guildId});
        return resp?.prefix;
    }

    public static async setGuildPrefix(guildId: string, newPrefix: string) {
        await GuildModel.updateOne({guildId}, {prefix: newPrefix});
    }

    public static async getCooldownTime(guildId: string) {
        const resp = await GuildModel.findOne({guildId});
        return resp?.cooldown;
    }

    public static async setCooldown(guildId: string, cooldown: number) {
        await GuildModel.updateOne({guildId}, {cooldown});
    }

    public static async isGuildModerator(guildId: string, roleId: string): Promise<boolean> {
        const resp = await GuildModel.findOne({guildId});

        return resp ? resp.moderatorRoleIds.includes(roleId) : false;
    }

    public static async addGuildModerator(guildId: string, ...roleIds: string[]) {
        await GuildModel.updateOne({guildId}, {$push: {moderatorRoleIds: {$each: roleIds}}});
    }

    public static async removeGuildModerator(guildId: string, ...roleIds: string[]) {
        await GuildModel.updateOne({guildId}, {$pullAll: {moderatorRoleIds: roleIds}});
    }

    public static async clearGuildModerator(guildId: string) {
        await GuildModel.updateOne({guildId}, {moderatorRoleIds: []});
    }

    public static async isPermanentlyMuted(guildId: string, userId: string) {
        const resp = await GuildModel.findOne({ guildId, 'permanentlyMuted.who': userId });

        return !!resp;
    }

    public static async isPermanentlyDeafed(guildId: string, userId: string) {
        const resp = await GuildModel.findOne({ guildId, 'permanentlyDeafed.who': userId });

        return !!resp;
    }

    public static async addNewGuild(guildId: string, createPrivateChannelId: string, prefix: string, cooldown: number) {
        return await GuildModel.create({
            guildId,
            createPrivateChannelId,
            prefix,
            cooldown
        })

    }

    public static async guildExits(guildId: string) {
        return !! await GuildModel.findOne({guildId});
    }

    public static async addPermanentlyMuted(guildId: string, who: string, by: string, reason?: string, time?: number) {
        const toPush: IUser = {
            who,
            by,
            reason,
            time
        }

        const upd = await GuildModel.updateOne({guildId, "permanentlyMuted.who": who },{ $set: {"permanentlyMuted.$": toPush}});
        if (!upd.matchedCount) await GuildModel.updateOne({guildId},{ $push: {permanentlyMuted: toPush}});
    }

    public static async removePermanentlyMuted(guildId: string, who: string) {
        await GuildModel.findOneAndUpdate({guildId},{$pull: {permanentlyMuted: {who}}});
    }

    public static async addPermanentlyDeafed(guildId: string, who: string, by: string, reason?: string, time?: number) {
        const toPush: IUser = {
            who,
            by,
            reason,
            time
        }

        const upd = await GuildModel.updateOne({guildId, "permanentlyDeafed.who": who },{ $set: {"permanentlyDeafed.$": toPush}});
        if (!upd.matchedCount) await GuildModel.updateOne({guildId},{ $push: {permanentlyDeafed: toPush}});
    }

    public static async removePermanentlyDeafed(guildId: string, who: string) {
        await GuildModel.findOneAndUpdate({guildId},{$pull: {permanentlyDeafed: {who}}});
    }
}