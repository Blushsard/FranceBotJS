/**
 * @author Benjamin Guirlet
 * @description
 *      La commande permettant de gérer les modules (activation/désactivation).
 */


const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction } = require( "discord.js" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "moyenne" )
	.setDescription( "[misc] Affiche la moyenne des likes." );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	try {
		await interaction.reply({
			content: `**Moyenne:** ${interaction.client.modules.get('moyenne').getMoyenne()}`,
			ephemeral: true
		});
	}
	catch ( err ) {
		interaction.client.emit( "error", err );
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute
}