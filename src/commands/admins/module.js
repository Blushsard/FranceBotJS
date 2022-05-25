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
	.setDescription( "Permet d'activer/désactiver un module." )
	.addStringOption( option =>
		option
			.setName( "nom_module" )
			.setDescription( "Le nom du module à activer/désactiver." )
			.setRequired( true )
			.addChoice( "Levels", 'levels' )
	)
	.addBooleanOption( option =>
		option
			.setName( "etat" )
			.setDescription( "Activer ou désactiver le module" )
			.setRequired( true )
	);


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	// Update du fichier modules.json.
	fs.readFile( `${process.cwd()}/data/modules.json`, function( err, buff ) {
		if ( err ) throw err;

		let modules = JSON.parse( buff );
		modules[interaction.options.get( "nom_module" ).value] = interaction.options.get( "etat" ).value;

		fs.writeFile( `${process.cwd()}/data/modules.json`, JSON.stringify( modules ), (err) => {
			if ( err ) throw err;
		});
	});

	// Update du module dans le client.
	interaction.client.modules.get( interaction.options.get( "nom_module" ).value ).setActive(
		interaction.options.get( "etat" ).value
	);

	await interaction.reply( { content: "Changement pris en compte!", ephemeral: true } );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute
}