import {IChatInputApplicationInteraction} from "@/interfaces/IApplicationInteraction";
import {GuildService} from "@/services/guild.service";
import {GuildMember} from "discord.js";

const interaction: IChatInputApplicationInteraction = {
    type: "CHAT_INPUT",
    name: "mute",
    description: "Mute user",
    options: [
        {
            name: 'user',
            description: 'User to mute',
            type: 'USER',
            required: true,
        },
        {
            name: 'reason',
            description: 'Mute reason',
            type: 'STRING',
            required: false,
        },
    ],
    run: async (interaction) => {
        if (!interaction.inGuild()) return;

        const memberBy = <GuildMember>interaction.member;
        const preMemberWho = interaction.options.getMember("user");
        const reason: string | undefined = interaction.options.getString("reason") ?? undefined;

        if (!preMemberWho)
            return await interaction.reply({ content: "No user with target id in guild", ephemeral: true });

        const memberWho = <GuildMember>preMemberWho;

        if (!(await GuildService.isGuildModerator(interaction.guildId, memberBy.id) || memberBy.permissions.has("ADMINISTRATOR"))) return await interaction.deferReply();

        if (await GuildService.isPermanentlyMuted(interaction.guildId, memberWho.id))
            return await interaction.reply({ content: "User is already muted permanently", ephemeral: true });

        await GuildService.addPermanentlyMuted(interaction.guildId, memberWho.id, memberBy.id, reason)
        await interaction.reply({content: "User has been muted permanently!", ephemeral: true});

        if (memberWho.voice.channel) {
            await memberWho.voice.setMute(true);
        }
    }
}

export default interaction;