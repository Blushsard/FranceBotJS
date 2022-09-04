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
	if ( !reaction || !user ) return;

	if ( reaction.partial ) {
		// Le try...catch permet d'eviter une erreur si le bot n'arrive pas a fetch l'emoji.
		try {
			await reaction.fetch();
		} catch ( err ) { return; }
	}

	const salon = await client.db.channelsManager.fetchChannel( reaction.message.channelId );
	await client.modules.get( "likes" ).updateLikeCount( reaction, salon, user, true );
	await client.modules.get( "reposts" ).checkRepost( reaction, salon, user, true );
	await client.modules.get( "stats" ).addEmojiCount( reaction.emoji.toString() );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageReactionAdd",
	execute
}
