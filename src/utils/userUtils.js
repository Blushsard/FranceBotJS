/**
 * @author Benjamin Guirlet
 * @file
 *		Ce fichier contient les fonctions liées aux utilisateurs.
 */


const { GuildMember } = require( "discord.js" );
const  { ADMINISTRATORS } = require( `${process.cwd()}/files/config.json` );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Vérifie si un utilisateur est un administrateur du bot.
 * Un utilisateur doit avoir la permission MANAGE_MESSAGE pour être considéré comme un adminis ou doit être dans la
 * liste des administrateurs du fichier config.json.
 * @param {GuildMember} user L'utilisateur à vérifier.
 * @returns {boolean} Un booléen indiquant si l'utilisateur a les permissions ou pas.
 */
function isUserAdmin( user ) {
	return user.permissions.has( "MANAGE_MESSAGES", true ) || ADMINISTRATORS.includes( user.id );
}


/**
 * Calcule l'expérience requise pour un niveau donné.
 * @param {int} level Le niveau pour lequel il faut calculer l'expérience requise.
 * @return {int} L'expérience requise.
 */
function getRequiredExpForLevel( level ) {
	return (5 * level**2 + 50) * level;
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	isUserAdmin,
	getRequiredExpForLevel
}