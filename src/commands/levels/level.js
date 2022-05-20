/**
 * @author Lothaire Guée
 * @description
 *      Contains the command 'getLevel'.
 *      Get current level of the user of specified user.
 */

// IMPORTS
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

// COMMANDE BUILD

const slashCommand = new SlashCommandBuilder()
    .setName("level")
    .setDescription(
        "[level] Obtenir votre niveau ou celui de la perosnne spécifié."
    )
	.addUserOption(option =>
		option.setName('user')
			.setDescription("Entrez l'utilisateur pour obtenir son level !"))
	

// FUNCTION

async function execute(interaction) {
	const user = interaction.options.getUser('user') ? interaction.options.getUser('user') : interaction.user
    const embed = new MessageEmbed()
	.setColor('#0099ff')
	.setAuthor({ name: user.username, iconURL: user.avatarURL()})
	.addFields(
		{ name: 'Rank', value: '9/12,703', inline: true },
		{ name: 'Level', value: '51 (30%)', inline: true },
		{ name: 'XP', value: '`144,238` xp total', inline: true },
	)

    return interaction.reply({
        embeds: [embed],
        ephemeral: false,
    });
}

// EXPORTS

module.exports = {
    data: slashCommand,
    execute,
};
