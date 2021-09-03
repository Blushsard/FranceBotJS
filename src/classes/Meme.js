/**
 * @author Benjamin Guirlet
 * @file
 *      The 'Meme' class is just a container for a meme's data.
 *      It ease the the use of the meme's data.
 */


class Meme {
    /**
     * @param {array} data An array that contains the meme's data.
     */
    constructor( data ) {
        this["msg_id"] = data[0];
        this["author_id"] = data[1];
        this["channel_id"] = data[2];
        this["_cat_name"] = data[3];
        this["likes"] = data[4];
        this["repost"] = data[5];
        this["msg_content"] = data[6];
        this["filename"] = data[7];
        this["file_type"] = data[8];
        this["meme_url"] = data[9];
        this["day_date"] = data[10];
        this["month_date"] = data[11];
        this["stf"] = data[12];
        this["stt"] = data[13];
        this["str"] = data[14];
    }
}


module.exports = {
    Meme
}
