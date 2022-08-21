/**
 * @author Benjamin Guirlet
 * @description
 *      Contient la commande 'refresh'.
 *      Cette commande permet aux utilisateurs de vérifier si leur niveau est à jour dans la base de données
 *      et si ils ont les bons rôles (si le bot est en partie down ou quelqu'un qui n'a pas parlé depuis le changement
 *      de atlas à FranceBotJS).
 */

const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction } = require( "discord.js" );

/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "refresh" )
	.setDescription( "[level] Met à jour vos rôles et votre niveau si ce n'est pas le cas (cas très rare)." );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	const member = interaction.member;
	const userDB = await interaction.client.db.usersManager.fetchUser( member.id );
	await interaction.client.modules.get( "levels" ).refreshUser( member, userDB );

	try {
		await interaction.reply({
			content: "Votre niveau et vos rôles ont été mis à jour.",
			ephemeral: true
		})
	}
	catch ( err ) {
		console.log( err );
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute
}