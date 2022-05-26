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
    .setName("leaderboard")
    .setDescription(
        "[level] Obtenir le leaderboard des premiers membres ayant le plus d'XP."
    )

// FUNCTION

async function execute(interaction) {
	const userUtils = interaction.client.db.usersManager;
	const usersLevel = await userUtils.fetchLeaderboard();

	if ( !usersLevel ) return interaction.reply( "Impossible de trouver le leaderboard... 😪" );

	let leaderboard;
	for (let i = 0; i < usersLevel.length; i++) {
		leaderboard[i] = `<@${usersLevel[i]['pk_user_id']}> ${usersLevel[i]['rang']}/${usersLevel[i]['total_users']}`;
	}
	
	console.log(usersLevel)
    const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setAuthor({ name: 'Test', iconURL: interaction.user.avatarURL()})
		.addField( 'Classement', leaderboard );

    return interaction.reply({
        embeds: [embed],
    });
}

// EXPORTS

module.exports = {
    data: slashCommand,
    execute,
};
