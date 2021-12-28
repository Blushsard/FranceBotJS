/**
 * @author Benjamin Guirlet
 * @file
 *		This file contains all the utilities functions linked to the users.
 */


const { GuildMember } = require( "discord.js" );
const  { ADMINISTRATORS } = require( "../files/config.json" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Check if an user is administrator.
 * He needs to have the MANAGE_MESSAGE permission or be in the administrators list in the config file.
 * @param {GuildMember} user
 * @returns {boolean}
 */
function isUserAdmin( user ) {
	return user.permissions.has( "MANAGE_MESSAGES", true ) || ADMINISTRATORS.includes( user.id );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	isUserAdmin
}