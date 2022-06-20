/**
 * @author Benjamin Guirlet
 * @description
 *      Evènement appelé quand un utilisateur rejoint un serveur.
 */
const { Client, GuildMember } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement.
 * @param {GuildMember} member L'utilisateur qui vient de rejoindre la guild.
 * @param {Client} client Le client du bot.
 */
async function execute( member, client ) {
	let userDb = await client.db.usersManager.fetchUser( member.id );
	if ( !userDb ) {
		await client.db.usersManager.addUser( member.id );
		return;
	}

	await client.modules.get( "levels" ).refreshUser( member, userDb );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "guildMemberAdd",
	execute
}