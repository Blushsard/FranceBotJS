/**
 * @author Benjamin Guirlet
 * @file
 *		Exemple de ContextMenuCommand pour potentiellement être utilisé plus tard.
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
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
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