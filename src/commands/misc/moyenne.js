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
		const content = `**Moyenne :** ${interaction.client.modules.get('moyenne').getMoyenne()}\n` +
			`**Moyenne des reposts:** ${interaction.client.modules.get('moyenne').getMoyenneRepost()}`;
		await interaction.reply({ content: content,  ephemeral: true });
	}
	catch ( err ) {}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute
}