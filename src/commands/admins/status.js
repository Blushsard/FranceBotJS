/**
 * @author Benjamin Guirlet
 * @description
 *      Donne le status des modules et/ou des salons avec des fonctionnalités actives.
 */
const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, MessageEmbed } = require( "discord.js" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "status" )
	.setDescription( "Donne le status des modules et/ou des salons avec des fonctionnalités actives." )
	.addBooleanOption( option =>
		option
			.setName( "modules" )
			.setDescription( "Affiche le status des modules si vrai." )
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
	let embeds = [];
	const options = interaction.options;

	if ( options.data.length === 0 ) {
		return interaction.reply({ content: "Vous devez indiquer au moins un paramètre !", ephemeral: true });
	}

	if ( options.get( "modules" ) ) {
		let embedDescription = "";
		interaction.client.modules.forEach( module => {
			embedDescription += `${module.active ? ":green_circle:": ":red_circle:"} **${module.constructor.name}**\n`;
		});
		embeds.push(
			new MessageEmbed()
				.setTitle( "État des modules" )
				.setDescription( embedDescription )
				.setAuthor({
					name: "| Fonctionnalités du salon",
					iconURL: interaction.user.avatarURL()
				})
		);
	}

	try {
		await interaction.reply({ embeds: embeds, ephemeral: true });
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