/**
 * @author Benjamin Guirlet
 * @file
 *      Cette commande permet de définir un salon comme salon de memes.
 *      Cet à dire que les fonctionnalités 'likes', 'repost', et 'threads' sont activés.
 */

const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, MessageEmbed } = require( "discord.js" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "set_memes" )
	.setDescription( "Permet de définir les fonctionnalités 'likes', 'reposts' et 'threads' en même temps." )
	.addBooleanOption( option =>
		option
			.setName( "actif" )
			.setDescription( "Définir un salon de memes." )
			.setRequired( true )
	);
/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	const actifValue = interaction.options.get( "actif" ).value;
	const sManager = interaction.client.db.channelsManager;
	await sManager.updateChannel( interaction.channelId, "b_likes", actifValue );
	await sManager.updateChannel( interaction.channelId, "b_reposts", actifValue );
	await sManager.updateChannel( interaction.channelId, "b_threads", actifValue );

	const embed = new MessageEmbed()
		.setDescription( `**Salon de memes :** ${actifValue}` )
		.setAuthor({
			name: "| Fonctionnalités du salon",
			iconURL: interaction.user.avatarURL()
		});

	try {
		await interaction.reply( { embeds: [ embed ], ephemeral: true } );
	}
	catch ( err ) {}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	adminsOnly: true,
	data: slashCommand,
	execute
}