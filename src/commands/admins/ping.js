const { SlashCommandBuilder } = require( "@discordjs/builders" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "ping" )
	.setDescription( "pong" );

async function execute( interaction ) {
	await interaction.reply( "Pong !" );
}

module.exports = {
	data: slashCommand,
	execute
}