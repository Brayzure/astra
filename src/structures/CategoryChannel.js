const Base = require("./Base");

class CategoryChannel extends Base {
    constructor(client, data) {
        super(client, data);

        this.update(data);
    }

    update(data) {
        super.update(data);
        
        if(data.hasOwnProperty("type")) this.type = data.type;

        if(data.guild_id) this.guildID = data.guild_id;
        if(data.hasOwnProperty("position")) this.position = data.position;
        if(data.permission_overwrites) this.overwrites = data.permission_overwrites;
        if(data.name) this.name = data.name;
        if(data.hasOwnProperty("nsfw")) this.nsfw = data.nsfw;
        if(data.hasOwnProperty("parent_id")) this.categoryID = data.parent_id;
        if(data.last_pin_timestamp) this.lastPin = data.last_pin_timestamp;
    }
}

module.exports = CategoryChannel;
