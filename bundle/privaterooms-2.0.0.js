var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/interfaces/IUser.ts
var UserSchemaInner;
var init_IUser = __esm({
  "src/interfaces/IUser.ts"() {
    UserSchemaInner = {
      who: { type: String, required: true },
      by: { type: String, required: true },
      reason: { type: String, default: "No reason" },
      time: { type: Number, default: Date.now }
    };
  }
});

// src/models/guild.model.ts
var import_mongoose, schema, GuildModel;
var init_guild_model = __esm({
  "src/models/guild.model.ts"() {
    import_mongoose = __toModule(require("mongoose"));
    init_IUser();
    schema = new import_mongoose.Schema({
      guildId: { type: String, required: true },
      moderatorRoleIds: [{ type: String, required: false }],
      prefix: { type: String, required: true, default: "$" },
      cooldown: { type: Number, required: true, default: 20 },
      createPrivateChannelId: { type: String, required: false },
      permanentlyMuted: [{ type: UserSchemaInner, required: false }],
      permanentlyDeafed: [{ type: UserSchemaInner, required: false }]
    });
    GuildModel = (0, import_mongoose.model)("Guild", schema);
  }
});

// src/services/guild.service.ts
var GuildService;
var init_guild_service = __esm({
  "src/services/guild.service.ts"() {
    init_guild_model();
    GuildService = class {
      static async isCreatePrivateChannel(guildId, channelId) {
        return !!await GuildModel.findOne({ guildId, createPrivateChannelId: channelId });
      }
      static async getCreatePrivateChannelId(guildId) {
        const resp = await GuildModel.findOne({ guildId });
        return resp == null ? void 0 : resp.createPrivateChannelId;
      }
      static async isGuildPrefix(guildId, prefix) {
        const resp = await GuildModel.findOne({ guildId, prefix });
        return !!resp;
      }
      static async getGuildPrefix(guildId) {
        const resp = await GuildModel.findOne({ guildId });
        return resp == null ? void 0 : resp.prefix;
      }
      static async setGuildPrefix(guildId, newPrefix) {
        await GuildModel.updateOne({ guildId }, { prefix: newPrefix });
      }
      static async getCooldownTime(guildId) {
        const resp = await GuildModel.findOne({ guildId });
        return resp == null ? void 0 : resp.cooldown;
      }
      static async setCooldown(guildId, cooldown) {
        await GuildModel.updateOne({ guildId }, { cooldown });
      }
      static async isGuildModerator(guildId, roleId) {
        const resp = await GuildModel.findOne({ guildId });
        return resp ? resp.moderatorRoleIds.includes(roleId) : false;
      }
      static async addGuildModerator(guildId, ...roleIds) {
        await GuildModel.updateOne({ guildId }, { $push: { moderatorRoleIds: { $each: roleIds } } });
      }
      static async removeGuildModerator(guildId, ...roleIds) {
        await GuildModel.updateOne({ guildId }, { $pullAll: { moderatorRoleIds: roleIds } });
      }
      static async clearGuildModerator(guildId) {
        await GuildModel.updateOne({ guildId }, { moderatorRoleIds: [] });
      }
      static async isPermanentlyMuted(guildId, userId) {
        const resp = await GuildModel.findOne({ guildId, "permanentlyMuted.who": userId });
        return !!resp;
      }
      static async isPermanentlyDeafed(guildId, userId) {
        const resp = await GuildModel.findOne({ guildId, "permanentlyDeafed.who": userId });
        return !!resp;
      }
      static async addNewGuild(guildId, createPrivateChannelId, prefix, cooldown) {
        return await GuildModel.create({
          guildId,
          createPrivateChannelId,
          prefix,
          cooldown
        });
      }
      static async guildExits(guildId) {
        return !!await GuildModel.findOne({ guildId });
      }
      static async addPermanentlyMuted(guildId, who, by, reason, time) {
        const toPush = {
          who,
          by,
          reason,
          time
        };
        const upd = await GuildModel.updateOne({ guildId, "permanentlyMuted.who": who }, { $set: { "permanentlyMuted.$": toPush } });
        if (!upd.matchedCount)
          await GuildModel.updateOne({ guildId }, { $push: { permanentlyMuted: toPush } });
      }
      static async removePermanentlyMuted(guildId, who) {
        await GuildModel.findOneAndUpdate({ guildId }, { $pull: { permanentlyMuted: { who } } });
      }
      static async addPermanentlyDeafed(guildId, who, by, reason, time) {
        const toPush = {
          who,
          by,
          reason,
          time
        };
        const upd = await GuildModel.updateOne({ guildId, "permanentlyDeafed.who": who }, { $set: { "permanentlyDeafed.$": toPush } });
        if (!upd.matchedCount)
          await GuildModel.updateOne({ guildId }, { $push: { permanentlyDeafed: toPush } });
      }
      static async removePermanentlyDeafed(guildId, who) {
        await GuildModel.findOneAndUpdate({ guildId }, { $pull: { permanentlyDeafed: { who } } });
      }
    };
  }
});

// src/interactions/mute.command.ts
var mute_command_exports = {};
__export(mute_command_exports, {
  default: () => mute_command_default
});
var interaction, mute_command_default;
var init_mute_command = __esm({
  "src/interactions/mute.command.ts"() {
    init_guild_service();
    interaction = {
      type: "CHAT_INPUT",
      name: "mute",
      description: "Mute user",
      options: [
        {
          name: "user",
          description: "User to mute",
          type: "USER",
          required: true
        },
        {
          name: "reason",
          description: "Mute reason",
          type: "STRING",
          required: false
        }
      ],
      run: async (interaction5) => {
        if (!interaction5.inGuild())
          return;
        const memberBy = interaction5.member;
        const preMemberWho = interaction5.options.getMember("user");
        const reason = interaction5.options.getString("reason") ?? void 0;
        if (!preMemberWho)
          return await interaction5.reply({ content: "No user with target id in guild", ephemeral: true });
        const memberWho = preMemberWho;
        if (!(await GuildService.isGuildModerator(interaction5.guildId, memberBy.id) || memberBy.permissions.has("ADMINISTRATOR")))
          return await interaction5.deferReply();
        if (await GuildService.isPermanentlyMuted(interaction5.guildId, memberWho.id))
          return await interaction5.reply({ content: "User is already muted permanently", ephemeral: true });
        await GuildService.addPermanentlyMuted(interaction5.guildId, memberWho.id, memberBy.id, reason);
        await interaction5.reply({ content: "User has been muted permanently!", ephemeral: true });
        if (memberWho.voice.channel) {
          await memberWho.voice.setMute(true);
        }
      }
    };
    mute_command_default = interaction;
  }
});

// src/interactions/unmute.command.ts
var unmute_command_exports = {};
__export(unmute_command_exports, {
  default: () => unmute_command_default
});
var interaction2, unmute_command_default;
var init_unmute_command = __esm({
  "src/interactions/unmute.command.ts"() {
    init_guild_service();
    interaction2 = {
      type: "CHAT_INPUT",
      name: "unmute",
      description: "Unmute user",
      options: [
        {
          name: "user",
          description: "User to unmute",
          type: "USER",
          required: true
        }
      ],
      run: async (interaction5) => {
        if (!interaction5.inGuild())
          return;
        const memberBy = interaction5.member;
        const preMemberWho = interaction5.options.getMember("user");
        if (!preMemberWho)
          return await interaction5.reply({ content: "No user with target id in guild", ephemeral: true });
        const memberWho = preMemberWho;
        if (!(await GuildService.isGuildModerator(interaction5.guildId, memberBy.id) || memberBy.permissions.has("ADMINISTRATOR")))
          return await interaction5.deferReply();
        await GuildService.removePermanentlyMuted(interaction5.guildId, memberWho.id);
        await interaction5.reply({ content: "User has been unmuted!", ephemeral: true });
        if (memberWho.voice.channel) {
          await memberWho.voice.setMute(false);
        }
      }
    };
    unmute_command_default = interaction2;
  }
});

// src/interactions/deaf.command.ts
var deaf_command_exports = {};
__export(deaf_command_exports, {
  default: () => deaf_command_default
});
var interaction3, deaf_command_default;
var init_deaf_command = __esm({
  "src/interactions/deaf.command.ts"() {
    init_guild_service();
    interaction3 = {
      type: "CHAT_INPUT",
      name: "deaf",
      description: "Deaf user",
      options: [
        {
          name: "user",
          description: "User to deaf",
          type: "USER",
          required: true
        },
        {
          name: "reason",
          description: "Deaf reason",
          type: "STRING",
          required: false
        }
      ],
      run: async (interaction5) => {
        if (!interaction5.inGuild())
          return;
        const memberBy = interaction5.member;
        const preMemberWho = interaction5.options.getMember("user");
        const reason = interaction5.options.getString("reason") ?? void 0;
        if (!preMemberWho)
          return await interaction5.reply({ content: "No user with target id in guild", ephemeral: true });
        const memberWho = preMemberWho;
        if (!(await GuildService.isGuildModerator(interaction5.guildId, memberBy.id) || memberBy.permissions.has("ADMINISTRATOR")))
          return await interaction5.deferReply();
        if (await GuildService.isPermanentlyDeafed(interaction5.guildId, memberWho.id))
          return await interaction5.reply({ content: "User is already deafed permanently", ephemeral: true });
        await GuildService.addPermanentlyDeafed(interaction5.guildId, memberWho.id, memberBy.id, reason);
        await interaction5.reply({ content: "User has been deafed permanently!", ephemeral: true });
        if (memberWho.voice.channel) {
          await memberWho.voice.setMute(true);
        }
      }
    };
    deaf_command_default = interaction3;
  }
});

// src/interactions/undeaf.command.ts
var undeaf_command_exports = {};
__export(undeaf_command_exports, {
  default: () => undeaf_command_default
});
var interaction4, undeaf_command_default;
var init_undeaf_command = __esm({
  "src/interactions/undeaf.command.ts"() {
    init_guild_service();
    interaction4 = {
      type: "CHAT_INPUT",
      name: "undeaf",
      description: "Undeaf user",
      options: [
        {
          name: "user",
          description: "User to undeaf",
          type: "USER",
          required: true
        }
      ],
      run: async (interaction5) => {
        if (!interaction5.inGuild())
          return;
        const memberBy = interaction5.member;
        const preMemberWho = interaction5.options.getMember("user");
        if (!preMemberWho)
          return await interaction5.reply({ content: "No user with target id in guild", ephemeral: true });
        const memberWho = preMemberWho;
        if (!(await GuildService.isGuildModerator(interaction5.guildId, memberBy.id) || memberBy.permissions.has("ADMINISTRATOR")))
          return await interaction5.deferReply();
        await GuildService.removePermanentlyDeafed(interaction5.guildId, memberWho.id);
        await interaction5.reply({ content: "User has been undeafed!", ephemeral: true });
        if (memberWho.voice.channel) {
          await memberWho.voice.setMute(false);
        }
      }
    };
    undeaf_command_default = interaction4;
  }
});

// src/utils/embeds.util.ts
var import_discord, channelCreationError, cooldownTime;
var init_embeds_util = __esm({
  "src/utils/embeds.util.ts"() {
    import_discord = __toModule(require("discord.js"));
    channelCreationError = new import_discord.MessageEmbed().setDescription("Error").setColor("#ff0f53");
    cooldownTime = (message) => new import_discord.MessageEmbed().setDescription(`Time remaining: ${message} s.`).setColor("#ff0f53");
  }
});

// src/models/voiceChannel.model.ts
var import_mongoose2, schema2, VoiceChannelModel;
var init_voiceChannel_model = __esm({
  "src/models/voiceChannel.model.ts"() {
    import_mongoose2 = __toModule(require("mongoose"));
    init_IUser();
    schema2 = new import_mongoose2.Schema({
      channelId: { type: String, required: true },
      ownerId: { type: String, required: true },
      mutedUsers: [{ type: UserSchemaInner, required: false }],
      deafedUsers: [{ type: UserSchemaInner, required: false }]
    });
    VoiceChannelModel = (0, import_mongoose2.model)("VoiceChannel", schema2);
  }
});

// src/services/voiceChannel.service.ts
var VoiceChannelService;
var init_voiceChannel_service = __esm({
  "src/services/voiceChannel.service.ts"() {
    init_voiceChannel_model();
    VoiceChannelService = class {
      static async isPrivateChannel(channelId) {
        return !!await VoiceChannelModel.findOne({ channelId });
      }
      static async isChannelOwner(channelId, userId) {
        return !!await VoiceChannelModel.findOne({ channelId, ownerId: userId });
      }
      static async isMutedInChannel(channelId, userId) {
        return !!await VoiceChannelModel.findOne({ channelId, "mutedUsers.who": userId });
      }
      static async isDeafedInChannel(channelId, userId) {
        return !!await VoiceChannelModel.findOne({ channelId, "deafedUsers.who": userId });
      }
      static async addNewChannel(channelId, ownerId) {
        await VoiceChannelModel.create({
          channelId,
          ownerId
        });
      }
      static async deleteChannel(channelId) {
        await VoiceChannelModel.findOneAndDelete({ channelId });
      }
      static async addMutedInChannel(channelId, who, by) {
        const toPush = {
          who,
          by
        };
        await VoiceChannelModel.findOneAndUpdate({ channelId }, { $push: { mutedUsers: toPush } });
      }
      static async removeMutedInChannel(channelId, who) {
        await VoiceChannelModel.findOneAndUpdate({ channelId }, { $pull: { mutedUsers: { who } } });
      }
      static async addDeafedInChannel(channelId, who, by) {
        const toPush = {
          who,
          by
        };
        await VoiceChannelModel.findOneAndUpdate({ channelId }, { $push: { deafedUsers: toPush } });
      }
      static async removeDeafedInChannel(channelId, who) {
        await VoiceChannelModel.findOneAndUpdate({ channelId }, { $pull: { deafedUsers: { who } } });
      }
    };
  }
});

// src/utils/check.utils.ts
async function checkUserDeafAndMute(newState) {
  const permMute = await GuildService.isPermanentlyMuted(newState.guild.id, newState.id);
  const permDeaf = await GuildService.isPermanentlyDeafed(newState.guild.id, newState.id);
  if (permMute || await VoiceChannelService.isMutedInChannel(newState.channelId, newState.id)) {
    await newState.setMute(true);
  } else {
    await newState.setMute(false);
  }
  if (permDeaf || await VoiceChannelService.isDeafedInChannel(newState.channelId, newState.id)) {
    await newState.setDeaf(true);
  } else {
    await newState.setDeaf(false);
  }
}
async function checkIfChannelEmptyAndDelete(oldState) {
  if (!oldState.channel) {
    return;
  }
  if (!await VoiceChannelService.isPrivateChannel(oldState.channelId)) {
    return;
  }
  if (oldState.channel.members.size) {
    return;
  }
  await oldState.channel.delete();
  await VoiceChannelService.deleteChannel(oldState.channelId);
  return;
}
var init_check_utils = __esm({
  "src/utils/check.utils.ts"() {
    init_guild_service();
    init_voiceChannel_service();
  }
});

// src/events/voice/joinedPrivateRoomCreation.event.ts
var joinedPrivateRoomCreation_event_exports = {};
__export(joinedPrivateRoomCreation_event_exports, {
  default: () => joinedPrivateRoomCreation_event_default
});
function setNewTimer(key, msTime) {
  return setTimeout(() => {
    creationCooldown.delete(key);
  }, msTime);
}
var import_discord2, creationCooldown, event, joinedPrivateRoomCreation_event_default;
var init_joinedPrivateRoomCreation_event = __esm({
  "src/events/voice/joinedPrivateRoomCreation.event.ts"() {
    import_discord2 = __toModule(require("discord.js"));
    init_guild_service();
    init_embeds_util();
    init_voiceChannel_service();
    init_check_utils();
    creationCooldown = /* @__PURE__ */ new Map();
    event = {
      name: "joinedPrivateRoomCreation",
      run: async (oldState, newState) => {
        var _a, _b, _c, _d, _e;
        if (oldState.channelId) {
          await checkIfChannelEmptyAndDelete(oldState);
        }
        const cooldownKey = `${newState.guild.id}:${newState.id}`;
        let userCooldown = creationCooldown.get(cooldownKey);
        const now = Date.now();
        if (userCooldown) {
          await ((_a = newState.member) == null ? void 0 : _a.send({ embeds: [cooldownTime(((userCooldown.until - now) / 1e3).toString())] }));
          await newState.disconnect("Cooldown");
          return;
        }
        let guildCooldown = await GuildService.getCooldownTime(newState.guild.id);
        if (!guildCooldown) {
          await ((_b = newState.member) == null ? void 0 : _b.send({ embeds: [channelCreationError] }));
          await newState.disconnect("Error");
          return;
        }
        guildCooldown *= 1e3;
        userCooldown = {
          until: now + guildCooldown,
          timer: setNewTimer(cooldownKey, guildCooldown)
        };
        creationCooldown.set(cooldownKey, userCooldown);
        const name = ((_c = newState.member) == null ? void 0 : _c.nickname) ?? ((_d = newState.member) == null ? void 0 : _d.user.username) ?? "Someone";
        const parentId = newState.channel.parentId;
        if (!parentId) {
          await ((_e = newState.member) == null ? void 0 : _e.send({ embeds: [channelCreationError] }));
          return;
        }
        const channel = await newState.guild.channels.create(name + "'s channel", {
          type: "GUILD_VOICE",
          parent: parentId,
          permissionOverwrites: [
            {
              id: newState.id,
              allow: [
                import_discord2.Permissions.FLAGS.MANAGE_CHANNELS,
                import_discord2.Permissions.FLAGS.MOVE_MEMBERS,
                import_discord2.Permissions.FLAGS.MUTE_MEMBERS,
                import_discord2.Permissions.FLAGS.DEAFEN_MEMBERS
              ]
            }
          ]
        });
        await VoiceChannelService.addNewChannel(channel.id, newState.id);
        await newState.setChannel(channel.id, "New private room");
        console.log(`[32mVoice channel created[0m ${newState.member.user.tag}`);
      }
    };
    joinedPrivateRoomCreation_event_default = event;
  }
});

// src/events/voice/joinVoice.event.ts
var joinVoice_event_exports = {};
__export(joinVoice_event_exports, {
  default: () => joinVoice_event_default
});
var event2, joinVoice_event_default;
var init_joinVoice_event = __esm({
  "src/events/voice/joinVoice.event.ts"() {
    init_check_utils();
    event2 = {
      name: "joinedVoice",
      run: async (newState) => {
        await checkUserDeafAndMute(newState);
      }
    };
    joinVoice_event_default = event2;
  }
});

// src/events/voice/leaveVoice.event.ts
var leaveVoice_event_exports = {};
__export(leaveVoice_event_exports, {
  default: () => leaveVoice_event_default
});
var event3, leaveVoice_event_default;
var init_leaveVoice_event = __esm({
  "src/events/voice/leaveVoice.event.ts"() {
    init_check_utils();
    event3 = {
      name: "leavedVoice",
      run: async (oldState) => {
        await checkIfChannelEmptyAndDelete(oldState);
      }
    };
    leaveVoice_event_default = event3;
  }
});

// src/events/voice/changedVoice.event.ts
var changedVoice_event_exports = {};
__export(changedVoice_event_exports, {
  default: () => changedVoice_event_default
});
var event4, changedVoice_event_default;
var init_changedVoice_event = __esm({
  "src/events/voice/changedVoice.event.ts"() {
    init_check_utils();
    event4 = {
      name: "changedVoice",
      run: async (oldState, newState) => {
        await checkUserDeafAndMute(newState);
        await checkIfChannelEmptyAndDelete(oldState);
      }
    };
    changedVoice_event_default = event4;
  }
});

// src/events/voice/mute.event.ts
var mute_event_exports = {};
__export(mute_event_exports, {
  default: () => mute_event_default
});
var event5, mute_event_default;
var init_mute_event = __esm({
  "src/events/voice/mute.event.ts"() {
    init_guild_service();
    init_voiceChannel_service();
    event5 = {
      name: "mutedInVoice",
      run: async (oldState, newState) => {
        var _a, _b;
        if (await GuildService.isPermanentlyMuted(newState.guild.id, newState.id)) {
          return;
        }
        if (!await VoiceChannelService.isPrivateChannel(newState.channelId)) {
          return;
        }
        const audit = await newState.guild.fetchAuditLogs({ type: 24, limit: 1 });
        const entry = audit.entries.first();
        if (!(entry && entry.executor && entry.target)) {
          return;
        }
        const isMute = (_a = entry.changes) == null ? void 0 : _a.find((change) => change.key === "mute" && change.new === true);
        if (!isMute) {
          return;
        }
        if (await VoiceChannelService.isChannelOwner(newState.channelId, newState.id)) {
          await newState.setMute(false);
          return;
        }
        await VoiceChannelService.addMutedInChannel(newState.channelId, newState.id, (_b = entry.executor) == null ? void 0 : _b.id);
      }
    };
    mute_event_default = event5;
  }
});

// src/events/voice/unMute.event.ts
var unMute_event_exports = {};
__export(unMute_event_exports, {
  default: () => unMute_event_default
});
var event6, unMute_event_default;
var init_unMute_event = __esm({
  "src/events/voice/unMute.event.ts"() {
    init_guild_service();
    init_voiceChannel_service();
    event6 = {
      name: "unMutedInVoice",
      run: async (oldState, newState) => {
        var _a;
        if (await GuildService.isPermanentlyMuted(newState.guild.id, newState.id)) {
          await newState.setMute(true);
          return;
        }
        if (!await VoiceChannelService.isPrivateChannel(newState.channelId)) {
          return;
        }
        const audit = await newState.guild.fetchAuditLogs({ type: 24, limit: 1 });
        const entry = audit.entries.first();
        if (!(entry && entry.executor)) {
          return;
        }
        const isMute = (_a = entry.changes) == null ? void 0 : _a.find((change) => change.key === "mute" && change.new === false);
        if (!isMute) {
          return;
        }
        await VoiceChannelService.removeMutedInChannel(newState.channelId, newState.id);
      }
    };
    unMute_event_default = event6;
  }
});

// src/events/voice/deaf.event.ts
var deaf_event_exports = {};
__export(deaf_event_exports, {
  default: () => deaf_event_default
});
var event7, deaf_event_default;
var init_deaf_event = __esm({
  "src/events/voice/deaf.event.ts"() {
    init_guild_service();
    init_voiceChannel_service();
    event7 = {
      name: "deafedInVoice",
      run: async (oldState, newState) => {
        var _a, _b;
        if (await GuildService.isPermanentlyDeafed(newState.guild.id, newState.id)) {
          return;
        }
        if (!await VoiceChannelService.isPrivateChannel(newState.channelId)) {
          return;
        }
        const audit = await newState.guild.fetchAuditLogs({ type: 24, limit: 1 });
        const entry = audit.entries.first();
        if (!(entry && entry.executor && entry.target)) {
          return;
        }
        const isDeaf = (_a = entry.changes) == null ? void 0 : _a.find((change) => change.key === "deaf" && change.new === true);
        if (!isDeaf) {
          return;
        }
        if (await VoiceChannelService.isChannelOwner(newState.channelId, newState.id)) {
          await newState.setDeaf(false);
          return;
        }
        await VoiceChannelService.addDeafedInChannel(newState.channelId, newState.id, (_b = entry.executor) == null ? void 0 : _b.id);
      }
    };
    deaf_event_default = event7;
  }
});

// src/events/voice/unDeaf.event.ts
var unDeaf_event_exports = {};
__export(unDeaf_event_exports, {
  default: () => unDeaf_event_default
});
var event8, unDeaf_event_default;
var init_unDeaf_event = __esm({
  "src/events/voice/unDeaf.event.ts"() {
    init_guild_service();
    init_voiceChannel_service();
    event8 = {
      name: "unDeafedInVoice",
      run: async (oldState, newState) => {
        var _a;
        if (await GuildService.isPermanentlyDeafed(newState.guild.id, newState.id)) {
          await newState.setDeaf(true);
          return;
        }
        if (!await VoiceChannelService.isPrivateChannel(newState.channelId)) {
          return;
        }
        const audit = await newState.guild.fetchAuditLogs({ type: 24, limit: 1 });
        const entry = audit.entries.first();
        if (!(entry && entry.executor)) {
          return;
        }
        const isDeaf = (_a = entry.changes) == null ? void 0 : _a.find((change) => change.key === "deaf" && change.new === false);
        if (!isDeaf) {
          return;
        }
        await VoiceChannelService.removeDeafedInChannel(newState.channelId, newState.id);
      }
    };
    unDeaf_event_default = event8;
  }
});

// src/utils/discord.utils.ts
function deleteMessage(message, time) {
  setTimeout(() => message.delete().catch(() => {
  }), time);
}
async function checkCreationchannel(guild, channelId) {
  const fetchedChannel = await guild.channels.fetch(channelId).catch(() => {
  });
  if (!(fetchedChannel && fetchedChannel.isVoice())) {
    return "There is no voice channel with target id";
  }
  if (!fetchedChannel.parentId) {
    return "Channel is not in Category";
  }
  return null;
}
async function checkAndGetGuildRole(guild, roleId) {
  return await guild.roles.fetch(roleId).catch(() => {
  });
}
var init_discord_utils = __esm({
  "src/utils/discord.utils.ts"() {
  }
});

// src/events/message/init.bot.event.ts
var init_bot_event_exports = {};
__export(init_bot_event_exports, {
  default: () => init_bot_event_default
});
var event9, init_bot_event_default;
var init_init_bot_event = __esm({
  "src/events/message/init.bot.event.ts"() {
    init_guild_service();
    init_discord_utils();
    init_src();
    event9 = {
      name: "messageCreate",
      run: async (message) => {
        var _a;
        if (!message.inGuild()) {
          return;
        }
        if (!((_a = message.member) == null ? void 0 : _a.permissions.has("ADMINISTRATOR"))) {
          return;
        }
        const [command, creationChannelId, prefix, cooldown, ...extra] = message.content.replace(/\s+/g, " ").trim().split(" ");
        if (command !== PrivateRooms.instance.botCommandsPrefix + "init") {
          return;
        }
        deleteMessage(message, 1e4);
        if (await GuildService.guildExits(message.guildId)) {
          const reply2 = await message.reply("Guild has been already initialized");
          deleteMessage(reply2, 1e4);
          return;
        }
        if (!creationChannelId) {
          const reply2 = await message.reply("Please, use ` private#init <ChannelId> [prefix] [cooldown (sec)] `");
          deleteMessage(reply2, 1e4);
          return;
        }
        if (extra.length > 0) {
          const reply2 = await message.reply("Too much arguments!");
          deleteMessage(reply2, 1e4);
          return;
        }
        const fetchedResult = await checkCreationchannel(message.guild, creationChannelId);
        if (fetchedResult) {
          const reply2 = await message.reply(fetchedResult);
          deleteMessage(reply2, 1e4);
          return;
        }
        if (!(+cooldown >= PrivateRooms.instance.minCooldownTime)) {
          const reply2 = await message.reply(`Cooldown is less than minimal (${PrivateRooms.instance.minCooldownTime})`);
          deleteMessage(reply2, 1e4);
          return;
        }
        if (!(+cooldown <= PrivateRooms.instance.maxCooldownTime)) {
          const reply2 = await message.reply(`Cooldown is more than maximum (${PrivateRooms.instance.maxCooldownTime})`);
          deleteMessage(reply2, 1e4);
          return;
        }
        const createdGuild = await GuildService.addNewGuild(message.guildId, creationChannelId, prefix, +cooldown);
        const reply = await message.reply(`Initial settings saved! CD: ${createdGuild.cooldown} P: ${createdGuild.prefix}`);
        deleteMessage(reply, 1e4);
      }
    };
    init_bot_event_default = event9;
  }
});

// src/events/message/prefix.bot.event.ts
var prefix_bot_event_exports = {};
__export(prefix_bot_event_exports, {
  default: () => prefix_bot_event_default
});
var event10, prefix_bot_event_default;
var init_prefix_bot_event = __esm({
  "src/events/message/prefix.bot.event.ts"() {
    init_guild_service();
    init_discord_utils();
    init_src();
    event10 = {
      name: "messageCreate",
      run: async (message) => {
        if (!message.inGuild()) {
          return;
        }
        const [command, ...extra] = message.content.replace(/\s+/g, " ").trim().split(" ");
        if (command !== PrivateRooms.instance.botCommandsPrefix + "prefix") {
          return;
        }
        deleteMessage(message, 1e4);
        const prefix = await GuildService.getGuildPrefix(message.guildId);
        if (!prefix) {
          const reply2 = await message.reply("Guild has not initialized");
          deleteMessage(reply2, 1e4);
          return;
        }
        const reply = await message.reply(`Guild prefix: ${prefix}`);
        deleteMessage(reply, 1e4);
      }
    };
    prefix_bot_event_default = event10;
  }
});

// src/events/message/prefix.change.event.ts
var prefix_change_event_exports = {};
__export(prefix_change_event_exports, {
  default: () => prefix_change_event_default
});
var event11, prefix_change_event_default;
var init_prefix_change_event = __esm({
  "src/events/message/prefix.change.event.ts"() {
    init_guild_service();
    init_discord_utils();
    event11 = {
      name: "guildChatCommand",
      run: async (message, prefix, command, ...args) => {
        var _a;
        if (!((_a = message.member) == null ? void 0 : _a.permissions.has("ADMINISTRATOR")))
          return;
        if (command !== "prefix")
          return;
        deleteMessage(message, 1e4);
        if (args.length != 1) {
          const reply2 = await message.reply(`Please, use \` ${prefix}prefix <new prefix> \``);
          deleteMessage(reply2, 1e4);
          return;
        }
        await GuildService.setGuildPrefix(message.guildId, args[0]);
        const reply = await message.reply(`Prefix updated!`);
        deleteMessage(reply, 1e4);
      }
    };
    prefix_change_event_default = event11;
  }
});

// src/events/message/creationchannel.change.event.ts
var creationchannel_change_event_exports = {};
__export(creationchannel_change_event_exports, {
  default: () => creationchannel_change_event_default
});
var event12, creationchannel_change_event_default;
var init_creationchannel_change_event = __esm({
  "src/events/message/creationchannel.change.event.ts"() {
    init_guild_service();
    init_discord_utils();
    event12 = {
      name: "guildChatCommand",
      run: async (message, prefix, command, ...args) => {
        var _a;
        if (!((_a = message.member) == null ? void 0 : _a.permissions.has("ADMINISTRATOR")))
          return;
        if (command !== "creationchannel")
          return;
        deleteMessage(message, 1e4);
        if (args.length != 1) {
          const reply2 = await message.reply(`Please, use \` ${prefix}creationchannel <new prefix> \``);
          deleteMessage(reply2, 1e4);
          return;
        }
        const creationChannelId = args[0];
        const fetchedResult = await checkCreationchannel(message.guild, creationChannelId);
        if (fetchedResult) {
          const reply2 = await message.reply(fetchedResult);
          deleteMessage(reply2, 1e4);
          return;
        }
        await GuildService.setGuildPrefix(message.guildId, creationChannelId);
        const reply = await message.reply(`Creation channel id updated!`);
        deleteMessage(reply, 1e4);
      }
    };
    creationchannel_change_event_default = event12;
  }
});

// src/events/message/moderators.event.ts
var moderators_event_exports = {};
__export(moderators_event_exports, {
  default: () => moderators_event_default
});
async function checkRoles(message, ...args) {
  const roles = [];
  for (let i = 1; i < args.length; i++) {
    const role = await checkAndGetGuildRole(message.guild, args[i]);
    if (!role)
      continue;
    roles.push(args[i]);
  }
  return roles;
}
var event13, moderators_event_default;
var init_moderators_event = __esm({
  "src/events/message/moderators.event.ts"() {
    init_guild_service();
    init_discord_utils();
    event13 = {
      name: "guildChatCommand",
      run: async (message, prefix, command, ...args) => {
        var _a;
        if (!((_a = message.member) == null ? void 0 : _a.permissions.has("ADMINISTRATOR")))
          return;
        if (command !== "moderators")
          return;
        deleteMessage(message, 1e4);
        if (args.length < 1 || args.length > 11 || !["add", "remove", "clear"].includes(args[0])) {
          const reply = await message.reply(`Please, use \` ${prefix}moderators <add|remove|clear> [roleId ..10] \``);
          deleteMessage(reply, 1e4);
          return;
        }
        if (args[0] === "clear") {
          await GuildService.clearGuildModerator(message.guildId);
          const reply = await message.reply(`Guild moderators list has been cleared`);
          deleteMessage(reply, 1e4);
          return;
        }
        const roles = await checkRoles(message, ...args);
        if (roles.length == 0) {
          const reply = await message.reply(`No real roleIds entered!`);
          deleteMessage(reply, 1e4);
          return;
        }
        if (args[0] === "add") {
          await GuildService.addGuildModerator(message.guildId, ...roles);
          const reply = await message.reply(`Roles added to moderators list! Added {${roles.length}/${args.length - 1}}
${roles}`);
          deleteMessage(reply, 6e4);
          return;
        }
        if (args[0] === "remove") {
          await GuildService.removeGuildModerator(message.guildId, ...roles);
          const reply = await message.reply(`Roles removed from moderators list! Removed {${roles.length}/${args.length - 1}}
${roles}`);
          deleteMessage(reply, 6e4);
          return;
        }
      }
    };
    moderators_event_default = event13;
  }
});

// src/events/message/cooldown.change.event.ts
var cooldown_change_event_exports = {};
__export(cooldown_change_event_exports, {
  default: () => cooldown_change_event_default
});
var event14, cooldown_change_event_default;
var init_cooldown_change_event = __esm({
  "src/events/message/cooldown.change.event.ts"() {
    init_guild_service();
    init_discord_utils();
    init_src();
    event14 = {
      name: "guildChatCommand",
      run: async (message, prefix, command, ...args) => {
        var _a;
        if (!((_a = message.member) == null ? void 0 : _a.permissions.has("ADMINISTRATOR")))
          return;
        if (command !== "cooldown")
          return;
        deleteMessage(message, 1e4);
        if (args.length != 1) {
          const reply2 = await message.reply(`Please, use \` ${prefix}cooldown <new cooldown in sec> \``);
          deleteMessage(reply2, 1e4);
          return;
        }
        const cooldown = args[0];
        if (!(+cooldown >= PrivateRooms.instance.minCooldownTime)) {
          const reply2 = await message.reply(`Cooldown is less than minimal (${PrivateRooms.instance.minCooldownTime})`);
          deleteMessage(reply2, 1e4);
          return;
        }
        if (!(+cooldown <= PrivateRooms.instance.maxCooldownTime)) {
          const reply2 = await message.reply(`Cooldown is more than maximum (${PrivateRooms.instance.maxCooldownTime})`);
          deleteMessage(reply2, 1e4);
          return;
        }
        await GuildService.setCooldown(message.guildId, +cooldown);
        const reply = await message.reply(`Cooldown updated!`);
        deleteMessage(reply, 1e4);
      }
    };
    cooldown_change_event_default = event14;
  }
});

// src/events/message/help.event.ts
var help_event_exports = {};
__export(help_event_exports, {
  default: () => help_event_default
});
var event15, help_event_default;
var init_help_event = __esm({
  "src/events/message/help.event.ts"() {
    init_discord_utils();
    init_src();
    event15 = {
      name: "guildChatCommand",
      run: async (message, prefix, command, ...args) => {
        var _a;
        if (!((_a = message.member) == null ? void 0 : _a.permissions.has("ADMINISTRATOR")))
          return;
        if (command !== "help")
          return;
        deleteMessage(message, 1);
        const botPrefix = PrivateRooms.instance.botCommandsPrefix;
        const reply = await message.reply(`
:pencil: All commands
\`${prefix}help\` - show all commands
\`${prefix}moderators add <roleID> ..[roleID]\` - add role to moderators list
\`${prefix}moderators remove <roleID> ..[roleID]\` - remove role from moderators list
\`${prefix}moderators clear\` - clear moderators list
\`${prefix}cooldown <time>\` - set room creation cooldown (in seconds)
\`${prefix}creationchannel <channelID>\` - change creationchannel for guild
\`${prefix}prefix <new prefix>\` - change bot prefix for guild
\`${botPrefix}prefix\` - show current prefix
\`${botPrefix}init <creationchannelID> [prefix] [cooldown]\` - initialize bot for guild
\`/mute <userID> [reason]\` - mute user
\`/deaf <userID> [reason]\` - deaf user
\`/unmute <userID>\` - unmute user
\`/undeaf <userID>\` - undeaf user`);
        deleteMessage(reply, 3e4);
      }
    };
    help_event_default = event15;
  }
});

// src/index.ts
__export(exports, {
  PrivateRooms: () => PrivateRooms,
  default: () => src_default
});
function src_default(client, options) {
  if (PrivateRooms.instance)
    throw new Error(PrivateRooms.instance.consoleLogsLabel + "Instance already created");
  new PrivateRooms(client, options);
}
var import_mongoose3, PrivateRooms;
var init_src = __esm({
  "src/index.ts"() {
    import_mongoose3 = __toModule(require("mongoose"));
    init_guild_service();
    PrivateRooms = class {
      constructor(client, options) {
        this.slashInteractions = /* @__PURE__ */ new Map();
        this.consoleLogsLabel = "[46m[37mPRooms[0m ";
        this.botCommandsPrefix = "pr#";
        this.minCooldownTime = 20;
        this.maxCooldownTime = 360;
        this.client = client;
        if (!(options == null ? void 0 : options.mongoURI) && import_mongoose3.default.connection.readyState !== 1) {
          throw new Error(this.consoleLogsLabel + "mongoURI not specified or mongo has not started before");
        } else {
          import_mongoose3.default.connect(options.mongoURI).then(() => console.log(this.consoleLogsLabel + "Mongo connected")).catch((err) => {
            console.error(err);
            throw new Error(this.consoleLogsLabel + "Mongo connection error");
          });
        }
        if (options == null ? void 0 : options.minCooldownTime)
          this.minCooldownTime = options.minCooldownTime;
        if (options == null ? void 0 : options.maxCooldownTime)
          this.maxCooldownTime = options.maxCooldownTime;
        if (options == null ? void 0 : options.consoleLogsLabel)
          this.consoleLogsLabel = options.consoleLogsLabel;
        if (options == null ? void 0 : options.botCommandsPrefix)
          this.botCommandsPrefix = options.botCommandsPrefix;
        PrivateRooms.instance = this;
        this.loadEvents();
        this.bindCustom();
        this.client.on("ready", () => {
          this.loadInteractions();
        });
      }
      async loadInteractions() {
        const importedL = [];
        importedL.push((await Promise.resolve().then(() => (init_mute_command(), mute_command_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_unmute_command(), unmute_command_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_deaf_command(), deaf_command_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_undeaf_command(), undeaf_command_exports))).default);
        for (const imported of importedL) {
          if (imported.permissions)
            imported.defaultPermission = false;
          this.slashInteractions.set(imported.name, imported);
        }
        const guild = await this.client.guilds.fetch("686257819913158659");
        await guild.commands.set(importedL).catch(console.error);
      }
      async loadEvents() {
        const importedL = [];
        importedL.push((await Promise.resolve().then(() => (init_joinedPrivateRoomCreation_event(), joinedPrivateRoomCreation_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_joinVoice_event(), joinVoice_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_leaveVoice_event(), leaveVoice_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_changedVoice_event(), changedVoice_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_mute_event(), mute_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_unMute_event(), unMute_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_deaf_event(), deaf_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_unDeaf_event(), unDeaf_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_init_bot_event(), init_bot_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_prefix_bot_event(), prefix_bot_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_prefix_change_event(), prefix_change_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_creationchannel_change_event(), creationchannel_change_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_moderators_event(), moderators_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_cooldown_change_event(), cooldown_change_event_exports))).default);
        importedL.push((await Promise.resolve().then(() => (init_help_event(), help_event_exports))).default);
        for (const imported of importedL) {
          if (imported.once)
            this.client.once(imported.name, imported.run);
          else
            this.client.on(imported.name, imported.run);
        }
      }
      bindCustom() {
        this.client.on("voiceStateUpdate", (oldState, newState) => this.customVoiceState(oldState, newState));
        this.client.on("messageCreate", (message) => this.guildChatCommandsHandler(message));
        this.client.on("interactionCreate", (interaction5) => this.guildInteractionCommandHendler(interaction5));
      }
      async guildChatCommandsHandler(message) {
        if (!message.inGuild())
          return;
        const guildPrefix = await GuildService.getGuildPrefix(message.guildId);
        if (!guildPrefix)
          return;
        const [commandAll, ...args] = message.content.replace(/\s+/g, " ").trim().split(" ");
        if (!commandAll.startsWith(guildPrefix))
          return;
        const command = commandAll.slice(guildPrefix.length);
        this.client.emit("guildChatCommand", message, guildPrefix, command, ...args);
      }
      async guildInteractionCommandHendler(interaction5) {
        if (!interaction5.isCommand())
          return;
        const command = this.slashInteractions.get(interaction5.commandName);
        if (!command)
          return;
        await command.run(interaction5);
      }
      async customVoiceState(oldState, newState) {
        if (newState.channelId && newState.channelId != oldState.channelId && await GuildService.isCreatePrivateChannel(newState.guild.id, newState.channelId)) {
          this.client.emit("joinedPrivateRoomCreation", oldState, newState);
          return;
        }
        if (!oldState.channel && newState.channel) {
          this.client.emit("joinedVoice", newState);
          return;
        }
        if (oldState.channel && !newState.channel) {
          this.client.emit("leavedVoice", oldState);
          return;
        }
        if (oldState.channelId !== newState.channelId) {
          this.client.emit("changedVoice", oldState, newState);
          return;
        }
        if (!oldState.serverMute && newState.serverMute) {
          this.client.emit("mutedInVoice", oldState, newState);
          return;
        }
        if (oldState.serverMute && !newState.serverMute) {
          this.client.emit("unMutedInVoice", oldState, newState);
          return;
        }
        if (!oldState.serverDeaf && newState.serverDeaf) {
          this.client.emit("deafedInVoice", oldState, newState);
          return;
        }
        if (oldState.serverDeaf && !newState.serverDeaf) {
          this.client.emit("unDeafedInVoice", oldState, newState);
          return;
        }
      }
    };
  }
});
init_src();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrivateRooms
});
