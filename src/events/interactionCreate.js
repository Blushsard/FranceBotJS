/**
 * @author Benjamin Guirlet
 * @file
 *		Évènement gérant les différentes interactions du client.
 */
const { CommandInteraction, Client } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement 'interactionCreate'.
 * @param {CommandInteraction} interaction L'interaction qui a déclenché l'évènement.
 * @param {Client} client Le client du bot.
 */
function execute( interaction, client ) {
	if ( interaction.isCommand() )
		client.commands.get( interaction.commandName ).execute( interaction );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "interactionCreate",
	execute
}