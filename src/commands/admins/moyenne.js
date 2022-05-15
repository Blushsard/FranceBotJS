/**
 * @author Benjamin Guirlet
 * @file
 *		Affiche les informations de la moyenne.
 */


const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, MessageEmbed } = require( "discord.js" );
const sqlUtils = require( `${process.cwd()}/utils/sqlUtils` );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "moyenne" )
	.setDescription( "Affiche des informations sur la moyenne." );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	const averageData = (await sqlUtils.query( "SELECT * FROM Average" ))[0];
	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.addField( "Moyenne actuelle", `${averageData["average"]}` )
				.addField( "Nombre de memes dans le calcul de la moyenne", `${averageData["nb_msg_average"]}` )
	]});
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute
}