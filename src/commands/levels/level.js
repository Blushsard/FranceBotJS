/**
 * @author Lothaire Guée
 * @description
 *      Contains the command 'getLevel'.
 *      Get current level of the user of specified user.
 */

// IMPORTS
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const sqlUtils = require( `${process.cwd()}/utils/sqlUtils` );
const userUtils = require( `${process.cwd()}/utils/userUtils` );

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
	const userLevel = await sqlUtils.fetchUser( user.id );

	let progressLevel;
	if ( userLevel['n_level'] === 0 )
		progressLevel = userLevel['n_xp'] * 100 / userUtils.getRequiredExpForLevel( userLevel['n_level'] + 1 );
	else {
		progressLevel = (userLevel['n_xp'] - userUtils.getRequiredExpForLevel( userLevel['n_level'] )) * 100 /
			(userUtils.getRequiredExpForLevel( userLevel['n_level'] + 1 ) - userUtils.getRequiredExpForLevel( userLevel['n_level'] ));
	}

    const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setAuthor({ name: user.username, iconURL: user.avatarURL()})
		.addFields(
			{ name: 'Rank', value: `${userLevel['rang']}/${userLevel['total_users']}`, inline: true },
			{ name: 'Level', value: `${userLevel['n_level']} (${progressLevel.toFixed( 2 )}%)`, inline: true },
			{ name: 'XP', value: `\`${userLevel['n_xp']}\` au total` , inline: true },
		);

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
