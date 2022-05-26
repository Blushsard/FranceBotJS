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

	let guildRoles = await client.db.rolesLevelsManager.fetchGuildRoles( member.guild.id );
	for ( let role of guildRoles ) {
		if ( role["n_niveau_requis"] <= userDb['n_level'] )
			await member.roles.add( role['pk_role_id'] );
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "guildMemberAdd",
	execute
}