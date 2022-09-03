/**
 * @author Benjamin Guirlet
 * @file
 *      Cette commande permet de définir le ou les rôles d'un salon par rapport au bot.
 *      Elle est réservée aux administrateurs.
 */


const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, MessageEmbed } = require( "discord.js" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "set" )
	.setDescription( "[admin] Permet d'activer/désactiver des fonctionnalités sur un salon." )
	.setDefaultPermission( false )
	.addBooleanOption( option =>
		option
			.setName( "memes" )
			.setDescription( "Definir un salon de memes." )
	)
	.addBooleanOption( option =>
		option
			.setName( "likes" )
			.setDescription( "Définir un salon de likes." )
	)
	.addBooleanOption( option =>
		option
			.setName( "reposts" )
			.setDescription( "Définir un salon de reposts." )
	)
	.addBooleanOption( option =>
		option
			.setName( "threads" )
			.setDescription( "Définir les threads dans un salon (bloque les messages)." )
	)
	.addBooleanOption( option =>
		option
			.setName( "feed" )
			.setDescription( "Définir un salon du feed." )
	)
	.addBooleanOption( option =>
		option
			.setName( "stats" )
			.setDescription( "Définir un salon des stats mensuelles." )
	)
	.addBooleanOption( option =>
		option
			.setName( "logs" )
			.setDescription( "Définir un salon des logs." )
	)
	.addBooleanOption( option =>
		option
			.setName( "exp" )
			.setDescription( "Définir un salon blacklisté pour l'exp." )
	)
	.addBooleanOption( option =>
		option
			.setName( "vote" )
			.setDescription( "Active l'ajout d'émoji sur les messages pour des votes.")
	)
	.setDefaultPermission(false);


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	const options = interaction.options;
	if ( options.data.length === 0 ) {
		return interaction.reply({ content: "Vous devez indiquer au moins un paramètre !", ephemeral: true });
	}

	const sManager = interaction.client.db.channelsManager;
	if ( options.get ( "likes" ) )
		await sManager.updateChannel( interaction.channelId, "b_likes", options.get( "likes" ).value );
	if ( options.get ( "reposts" ) )
		await sManager.updateChannel( interaction.channelId, "b_reposts", options.get( "reposts" ).value );
	if ( options.get ( "threads" ) )
		await sManager.updateChannel( interaction.channelId, "b_threads", options.get( "threads" ).value );
	if ( options.get ( "feed" ) )
		await sManager.updateChannel( interaction.channelId, "b_feed", options.get( "feed" ).value );
	if ( options.get ( "logs" ) ) {
		await sManager.updateChannel(interaction.channelId, "b_logs", options.get( "logs" ).value);
		// Mise à jour de la valeur de l'attribut du module Logs qui contient l'ID du salon des logs.
		options.get( "logs" ).value
			? interaction.client.modules.get( "logs" ).logChannelId = interaction.channelId
			: interaction.client.modules.get( "logs" ).logChannelId = null;
	}
	if ( options.get ( "stats" ) )
		await sManager.updateChannel( interaction.channelId, "b_stats", options.get( "stats" ).value );
	if ( options.get ( "exp" ) )
		await sManager.updateChannel( interaction.channelId, "b_exp", options.get( "exp" ).value );
	if ( options.get( "memes" ) ) {
		await sManager.updateChannel( interaction.channelId, "b_likes", options.get( "memes" ).value );
		await sManager.updateChannel( interaction.channelId, "b_reposts", options.get( "memes" ).value );
		await sManager.updateChannel( interaction.channelId, "b_threads", options.get( "memes" ).value );
	}
	if ( options.get( "vote" ) )
		await sManager.updateChannel( interaction.channelId, "b_vote", options.get( "vote" ).value );

	const channel = await sManager.fetchChannel( interaction.channelId );
	const embed = new MessageEmbed()
		.setDescription(
			`**Likes :** ${convertIntToBoolean( channel["b_likes"] )}\n` +
			`**Reposts :** ${convertIntToBoolean( channel["b_reposts"] )}\n` +
			`**Threads :** ${convertIntToBoolean( channel["b_threads"] )}\n` +
			`**Feed :** ${convertIntToBoolean( channel["b_feed"] )}\n` +
			`**Logs :** ${convertIntToBoolean( channel["b_logs"] )}\n` +
			`**Stats :** ${convertIntToBoolean( channel["b_stats"] )}\n` +
			`**Exp: ** ${convertIntToBoolean( !channel["b_exp"] )}\n`+
			`**Vote: ** ${convertIntToBoolean( !channel["b_vote"] )}`
		)
		.setAuthor({
			name: "| Fonctionnalités du salon",
			iconURL: interaction.user.avatarURL()
		});

	try {
		await interaction.reply( { embeds: [ embed ], ephemeral: true } );
	}
	catch ( err ) { interaction.client.emit( "error", err ); }
}


function convertIntToBoolean( intBoolean ) {
	return intBoolean === 0 ? "Inactif": "Actif";
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	adminsOnly: true,
	data: slashCommand,
	execute
}