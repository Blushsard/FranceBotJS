/**
 * @author Benjamin Guirlet
 * @file
 *		Just a ContextMenuCommand to test out this functionnality.
 */


const { ContextMenuCommandBuilder } = require( "@discordjs/builders" );
const { ContextMenuInteraction } = require( "discord.js" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const cmCommand = new ContextMenuCommandBuilder()
	.setName( "read_message" )
	.setType( 3 );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * The handler for this command file.
 * @param {ContextMenuInteraction} interaction the interaction issued by the command.
 */
async function execute( interaction ) {
	const msgContent = interaction.channel.messages.cache.get( interaction.targetId ).content;
	await interaction.reply( msgContent === "" ? "Pas de msgContent" : `Contenu du message : ${msgContent}` );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: cmCommand,
	execute
}