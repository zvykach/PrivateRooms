import {IChatInputApplicationInteraction} from "@/interfaces/IApplicationInteraction";
import {GuildService} from "@/services/guild.service";
import {GuildMember} from "discord.js";

const interaction: IChatInputApplicationInteraction = {
    type: "CHAT_INPUT",
    name: "undeaf",
    description: "Undeaf user",
    options: [
        {
            name: 'user',
            description: 'User to undeaf',
            type: 'USER',
            required: true,
        }
    ],
    run: async (interaction) => {
        if (!interaction.inGuild()) return;

        const memberBy = <GuildMember>interaction.member;
        const preMemberWho = interaction.options.getMember("user");

        if (!preMemberWho)
            return await interaction.reply({ content: "No user with target id in guild", ephemeral: true });

        const memberWho = <GuildMember>preMemberWho;

        if (!(await GuildService.isGuildModerator(interaction.guildId, memberBy.id) || memberBy.permissions.has("ADMINISTRATOR"))) return await interaction.deferReply();

        await GuildService.removePermanentlyDeafed(interaction.guildId, memberWho.id)
        await interaction.reply({content: "User has been undeafed!", ephemeral: true});

        if (memberWho.voice.channel) {
            await memberWho.voice.setMute(false);
        }
    }
}

export default interaction;