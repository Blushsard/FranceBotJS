/**
 * @author Benjamin Guirlet
 * @file
 *      La commande 'clean_channels' permet de supprimer tout les salons inutilisés de la base de données.
 *      Elle est  réservée aux administrateurs.
 */


const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction } = require( "discord.js" );
const sqlUtils = require( `${process.cwd()}/utils/sqlUtils` );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "clean_channels" )
	.setDescription( "Supprime tout les salons inutilisés de la table Channels." )
	.setDefaultPermission( false );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	await sqlUtils.query(
		"DELETE FROM Channels " +
		"HERE b_memes=false AND b_reposts=false AND b_feed=false AND b_logs=false AND b_stats=false AND _exp=false;"
	);

	await interaction.reply(
		{ content: "Tout les salons inutilisés ont été supprimés de la base de données!", ephemeral: true }
	);
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	adminsOnly: true,
	data: slashCommand,
	execute
}