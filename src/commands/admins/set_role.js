/**
 * @author Benjamin Guirlet
 * @description
 *      La commande permettant de gérer les roles palier des niveaux.
 */
const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction } = require( "discord.js" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "set_role" )
	.setDescription( "[admin] Définit un rôle pour un niveau atteint. Ne pas mettre de rôle = supprime le rôle du level." )
	.addIntegerOption( option =>
		option
			.setName( "niveau_requis" )
			.setDescription( "Le niveau à atteindre pour débloquer le rôle." )
			.setRequired( true )
	)
	.addRoleOption( option =>
		option
			.setName( "role_palier" )
			.setDescription( "Le rôle à donner pour le niveau (vide pour supprimer le palier actuel)." )
	)
	.setDefaultPermission(false);


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	let rlManager = interaction.client.db.rolesLevelsManager;
	let options = interaction.options;
	let niveau = options.get("niveau_requis").value;

	if ( !interaction.options.get( "role_palier" ) )
		await rlManager.removeRoleByLevel( niveau, interaction.guildId );
	else {
		// Si le serveur à déjà un rôle pour le niveau demandé.
		if ( await rlManager.fetchRoleByLevel( niveau, interaction.guildId ) )
			await rlManager.updateRoleByLevel( options.getRole( "role_palier" ).id, niveau, interaction.guildId );
		else
			await rlManager.ajouterRoleLevel( options.getRole( 'role_palier' ).id, interaction.guildId, niveau );
	}

	try {
		await interaction.reply({
			content: `Le rôle ${options.getRole( "role_palier" )} a bien été défini comme palier pour le niveau ${niveau}!`,
			ephemeral: true
		});
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