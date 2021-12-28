/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains the command 'clear_channels'.
 *      This command removes all the unused channels from the database.
 *      It is administrator only.
 */


const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction } = require( "discord.js" );
const sqlUtils = require( "../../utils/sqlUtils" );


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
 * Handler for this slashCommand command.
 * @param {CommandInteraction} interaction The interaction generated by the command's execution.
 */
async function execute( interaction ) {
	await sqlUtils.query(
		"DELETE FROM Channels WHERE memes=false AND reposts=false AND feed=false AND logs=false AND stats=false;"
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