const { SlashCommandBuilder } = require( "@discordjs/builders" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "ping" );

async function execute( interaction ) {
	await interaction.reply( "Pong !" );
}

module.exports = {
	data: slashCommand,
	execute
}