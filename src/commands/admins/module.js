/**
 * @author Benjamin Guirlet
 * @description
 *      La commande permettant de gérer les modules (activation/désactivation).
 */


const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction } = require( "discord.js" );
const fs = require( "fs" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "module" )
	.setDescription( "[admin] Permet d'activer/désactiver un module." )
	.addStringOption( option =>
		option
			.setName( "nom_module" )
			.setDescription( "Le nom du module à activer/désactiver." )
			.setRequired( true )
			.addChoices([
				[ "Levels", 'levels' ],
				[ "Likes", 'likes' ],
				[ "Feed", 'feed' ],
				[ "Reposts", 'reposts' ],
				[ "Threads", 'threads' ],
				[ "Twitter", 'twitter' ],
				[ "Reddit", 'reddit' ],
				[ "Stats", 'stats' ],
				[ "Logs", 'logs' ],
				[ "Vote", 'vote' ]
			])
	)
	.addBooleanOption( option =>
		option
			.setName( "etat" )
			.setDescription( "Activer ou désactiver le module" )
			.setRequired( true )
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
	// Update du fichier modules.json.
	let modules = JSON.parse( fs.readFileSync( `${process.cwd()}/data/modules.json` ) );
	modules[interaction.options.get( "nom_module" ).value] = interaction.options.get( "etat" ).value;
	fs.writeFileSync( `${process.cwd()}/data/modules.json`, JSON.stringify( modules ) );

	// Update du module dans le client.
	interaction.client.modules.get( interaction.options.get( "nom_module" ).value )
		.active = interaction.options.get( "etat" ).value;

	try {
		await interaction.reply( { content: "Changement pris en compte!", ephemeral: true } );
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