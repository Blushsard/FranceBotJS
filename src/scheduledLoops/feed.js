/**
 * @author Benjamin Guirlet
 * @file
 *		Le feed permet d'envoyer les memes dépassant la moyenne en likes dans un salon spécial pour les mettres en
 *		valeur. Ils seront ensuite envoyés sur d'autres sites comme twitter ou reddit.
 */


const sqlUtils = require( "../utils/sqlUtils" );
const { MessageEmbed } = require( "discord.js" );

/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * The while loop managing the feed channel.
 */
async function feed() {
	const feedLoop = setInterval( async () => {
		// On a besoin de require le client à chaque itération car cette fonction fléchée ne trouve pas les variables
		// qui sont dans la scope de la fonction feed() ou dans la scope globale.
		const { client } = require( "../index" );

		const guild = client.guilds.cache.at( 0 );

		const feedChannelIds = await sqlUtils.fetchChannelByValue( "feed", true );
		if ( !feedChannelIds.length ) return;	// Dans le cas où il n'y a pas de salon pour le feed.
		const feedChannel = guild.channels.cache.get( feedChannelIds[0] );

		const likesAverage = await sqlUtils.getLikesAverage( "SELECT average FROM LikesAverage" );
		const messages = await sqlUtils.fetchMessages( `likes>=${likesAverage} AND stf=0` );

		// On traite chaque message ici.
		for ( const msg of messages ) {
			const author = guild.members.cache.get( msg["author_id"] );
			const title = msg["content"] === "" ? `Message par ${author.nickname}` : msg["content"];
			console.log( `Message par ${author.nickname}` );

			const attachments = await sqlUtils.fetchAttachments( msg["msg_id"] );
			const embedEnd = new MessageEmbed().setDescription( "Fin des memes!" );
			const embedBegin = new MessageEmbed()
				.setTitle( title )
				.setURL( msg )
				.setDescription( `Contient ${attachments.length} meme(s).` );

			const attachmentsArray = [];
			for ( const attach of attachments )
				attachmentsArray.push( attach["url"] );

			await feedChannel.send( { embeds : [ embedBegin ] } );
			await feedChannel.send( { files : attachmentsArray } );
			await feedChannel.send( { embeds : [ embedEnd ] } );

			await sqlUtils.updateMessage( msg["msg_id"], "stf", true );
		}
	}, 1_000);
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	feed
}