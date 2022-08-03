/**
 * @author Benjamin Guirlet
 * @description
 *      Evènement appelé quand un utilisateur est banni d'un serveur.
 */
const { Client, GuildBan } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement.
 * @param {GuildBan} ban L'utilisateur qui vient de rejoindre la guild.
 * @param {Client} client Le client du bot.
 */
async function execute( ban, client ) {
	if ( !ban ) return;
	await ban.fetch();

	await client.db.usersManager.removeUser( ban.user.id );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "guildMemberAdd",
	execute
}