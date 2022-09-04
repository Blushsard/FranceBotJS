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
        "[level] Obtenir votre niveau ou celui de la personne spécifié."
    )
	.addUserOption(option =>
		option.setName('user')
			.setDescription("Entrez l'utilisateur pour obtenir son level !"))
	

// FUNCTION

async function execute(interaction) {
	const user = interaction.options.getUser('user') ? interaction.options.getUser('user') : interaction.user
	const levels = interaction.client.modules.get( 'levels' );
	const userUtils = interaction.client.db.usersManager;
	const userLevel = await userUtils.fetchUser( user.id );

	if ( !userLevel ) return interaction.reply( "L'utilisateur n'a pas d'expérience!" );

	const progress = await levels.refreshProgressUser( userLevel );

    const embed = new MessageEmbed()
		.setColor('#0099ff')
		.addFields([
			{name: 'Rank', value: `${userLevel['rang']}/${userLevel['total_users']}`, inline: true},
			{name: 'Level', value: `${userLevel['n_level']} (${progress.toFixed( 2 )}%)`, inline: true},
			{name: 'XP', value: `\`${userLevel['n_xp']}\` au total`, inline: true}
		]);

	if ( user?.username && typeof user.username === 'string' )
		embed.setAuthor({ name: user.username, iconURL: user.avatarURL()})

	try {
		return interaction.reply({
			embeds: [embed],
		});
	}
	catch ( err ) { interaction.client.emit( "error", err ); }
}

// EXPORTS

module.exports = {
    data: slashCommand,
    execute,
};
