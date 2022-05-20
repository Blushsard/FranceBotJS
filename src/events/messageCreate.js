/**
 * @author Benjamin Guirlet
 * @file
 *		Cet évènement est utilisé pour stocker les messages et leurs pièces-jointes dans la base de données.
 */


const sqlUtils = require( `${process.cwd()}/utils/sqlUtils` );
const msgUtils = require( `${process.cwd()}/utils/messageUtils` );
const userUtils = require( `${process.cwd()}/utils/userUtils` );
const { LIKE_EMOJI_MENTION, REPOST_EMOJI_MENTION } = require( `${process.cwd()}/files/config.json` );
const { Client, Message, MessageEmbed } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement 'interactionCreate'.
 * @param {Message} message Le message qui vient d'être créé.
 * @param {Client} client Le client qui a émit l'évènement.
 */
async function execute( message, client ) {
	const channel = await sqlUtils.fetchChannel( message.channelId );
	if ( !channel )
		return;

	// Ajout de l'exp.
	if ( channel["exp"] && !message.author.bot ) {
		let user = null;
		const msTime = (new Date()).getTime();
		if ( client.expLimits.has( message.author.id ) ) {
			if ( msTime > client.expLimits.get( message.author.id ) + 60_000 ) {
				user = await sqlUtils.addExpToUser( message.author.id, 8 );
				client.expLimits.set( message.author.id, msTime );
			}
		}
		else {
			client.expLimits.set( message.author.id, msTime );
			user = await sqlUtils.addExpToUser( message.author.id, 8 );
		}


		// Si l'utilisateur monte de niveau.
		if ( user ) {
			user["n_nb_messages"]++;

			await sqlUtils.updateUser( user["pk_user_id"], "n_nb_messages", user["n_nb_messages"] );

			if ( userUtils.getRequiredExpForLevel( user["n_level"] + 1 ) < user["n_xp"] ) {
				user["n_level"]++;
				await sqlUtils.updateUser( user["pk_user_id"], "n_level", user["n_level"] );

				await message.reply({
					embeds: [
						new MessageEmbed()
							.setDescription( `Vous êtes maintenant niveau ${user['n_level']} !\n` )
							.setAuthor({
								name: "| Vous avez atteint le niveau supérieur !",
								iconURL: message.author.avatarURL()
							})
					]
				});
			}
		}
	}

	/*
	if ( channel["threads"] ) {
		if ( !message.interaction ) {
			await message.startThread({
				name: `Réponse | ${message.author.username} (${message.author.id})`,
				autoArchiveDuration: 1440 });
		}
	}

	if ( channel["memes"] ) {
		if ( msgUtils.hasMeme( message ) ) {
			await msgUtils.addMemeToDatabase( message, 0 );
			await message.react( LIKE_EMOJI_MENTION );
			await message.react( REPOST_EMOJI_MENTION );
		}
		else {
			if ( !userUtils.isUserAdmin( message.member ) ) {
				await message.delete();
				// return; À décommenter si d'autres statements sont ajoutés après.
			}
		}
	}*/
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageCreate",
	execute
}
