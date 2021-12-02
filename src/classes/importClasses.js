/**
 * @author Benjamin Guirlet
 * @description
 *      This file is used as a proxy to easely import all the classes.
 */


const { Message } = require( "src/classes/DMessage" );
const { Attachment } = require( "Attachment" );
const { Channel } = require( "Channel" );


module.exports = {
	Message,
	Attachment,
	Channel
}