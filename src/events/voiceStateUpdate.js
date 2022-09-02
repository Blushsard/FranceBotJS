/**
 * @author Benjamin Guirlet
 * @description
 *      Cet evenement est utilise pour attribuer de l'exp en fonction du temps passe connecte dans un salon vocal.
 */

const { Client, VoiceState } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Event appele lorsqu'un utilisateur change d'etat vocal.
 * Cela comprend : connexion, deconnexion, mute, unmute.
 * @param {VoiceState} oldState Le voiceState avant l'update.
 * @param {VoiceState} newState Le voiceState après l'update.
 * @param {Client} client Le client du bot.
 */
async function execute( oldState, newState, client ) {
	if ( !oldState || !newState ) return;
	await client.modules.get( "levels" ).ajouterExperienceVocal( oldState, newState );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "voiceStateUpdate",
	execute
}
