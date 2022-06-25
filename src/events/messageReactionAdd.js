/**
 * @author Benjamin Guirlet
 * @file
 *		Handler pour l'évènement messageReactionAdd.
 */

const { Client, MessageReaction, User } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement.
 * @param {MessageReaction} reaction L'objet de la réaction.
 * @param {User} user L'utilisateur qui a ajouté la réaction.
 * @param {Client} client Le client qui a émit l'évènement.
 */
async function execute( reaction, user, client ) {
	const salon = await client.db.channelsManager.fetchChannel( reaction.message.channelId );
	await client.modules.get( "memes" ).updateLikeCount( reaction, salon, user );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageReactionAdd",
	execute
}
