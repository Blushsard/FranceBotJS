/**
 * @author Benjamin Guirlet
 * @file
 *		Évènement gérant les différentes interactions du client.
 */


const { CommandInteraction, ContextMenuInteraction, Client } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement 'interactionCreate'.
 * @param {CommandInteraction|ContextMenuInteraction} interaction L'interaction qui a déclenché l'évènement.
 * @param {Client} client Le client qui a créé l'interaction.
 */
function execute( interaction, client ) {
	if ( interaction.isCommand() )
		client.commands.get( interaction.commandName ).execute( interaction );
	else if ( interaction.isContextMenu() )
		client.commands.get( interaction.commandName ).execute( interaction );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "interactionCreate",
	execute
}