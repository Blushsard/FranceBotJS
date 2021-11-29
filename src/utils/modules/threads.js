/**
 * @author Lothaire Guée
 * @description
 * 		The file contains the functions to set a thread after each meme.
 */


/*      AUTHORISATION      */
const { Threads } = require('../../files/modules.js');

/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
function threads(msg){
    if(Threads == false) return;

    if(msg.content != ""){
        var messageContent = " - " + msg.content
    }
    else{
        var messageContent = ""
    }

    var messageTotal = "Réponses ┃ " + msg.author.username + messageContent + " (" + msg.id + ") "
    
    if(messageTotal.length >= 100){
        messageTotal = "Réponses ┃ " + msg.author.username + " (" + msg.id + ") "
    }

    for(let i = 0; i < THREAD_CHANNELS_ALLOWED.length; i++){
        if(msg.channel.id === THREAD_CHANNELS_ALLOWED[i]){

            const thread = msg.startThread({
                name: messageTotal,
                autoArchiveDuration: 1440,
            });

        }
    }
}

function deleteThreads(msg){
    if(Threads == false) return;

    for(let i = 0; i < THREAD_CHANNELS_ALLOWED.length; i++){
        if(msg.channel.id === THREAD_CHANNELS_ALLOWED[i]){

            const thread = msg.thread.delete("Message supprimé")

        }
    }
}

module.exports ={
    threads,
    deleteThreads
}