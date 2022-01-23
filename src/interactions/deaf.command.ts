import {IChatInputApplicationInteraction} from "@/interfaces/IApplicationInteraction";
import {GuildService} from "@/services/guild.service";
import {GuildMember} from "discord.js";

const interaction: IChatInputApplicationInteraction = {
    type: "CHAT_INPUT",
    name: "deaf",
    description: "Deaf user",
    options: [
        {
            name: 'user',
            description: 'User to deaf',
            type: 'USER',
            required: true,
        },
        {
            name: 'reason',
            description: 'Deaf reason',
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

        if (await GuildService.isPermanentlyDeafed(interaction.guildId, memberWho.id))
            return await interaction.reply({ content: "User is already deafed permanently", ephemeral: true });

        await GuildService.addPermanentlyDeafed(interaction.guildId, memberWho.id, memberBy.id, reason)
        await interaction.reply({content: "User has been deafed permanently!", ephemeral: true});

        if (memberWho.voice.channel) {
            await memberWho.voice.setMute(true);
        }
    }
}

export default interaction;