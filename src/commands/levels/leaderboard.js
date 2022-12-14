/**
 * @author Lothaire GuÃ©e
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

	if ( !usersLevel ) return interaction.reply( "Impossible de trouver le leaderboard... ðª" );

	let leaderboard = "";
	for (let i = 0; i < usersLevel.length; i++) {
		let rank = " ";
		switch(i){
			case 0:
				rank = "ð"
				break;
			case 1 :
				rank = "ð¥"
				break;
			case 2 :
				rank = "ð¥"
				break;
			default :
				rank = i + 1;
		}

		usersLevel[i]['n_progress'] = await interaction.client.modules.get('levels').refreshProgressUser( usersLevel[i] );
		leaderboard += `**${rank}** - <@${usersLevel[i]['pk_user_id']}> - **LVL ${usersLevel[i]['n_level']}**, ${usersLevel[i]['n_progress'].toFixed(2)}%\n`;
	}
	
    const embed = new MessageEmbed()
		.setColor('#0099ff')
		.addFields( [{name: `Classement sur ${usersLevel[0]['total_users']}`, value: leaderboard}] )
		.setFooter({text:interaction.guild.name, iconURL:interaction.guild.iconURL()})
		.setTimestamp();

	if ( interaction?.client?.user?.username && typeof interaction.client.user.username === 'string' )
		embed.setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})

	try {
		return interaction.reply({
			embeds: [embed],
		});
	}
	catch ( err ) {}
}

// EXPORTS

module.exports = {
    data: slashCommand,
    execute,
};
