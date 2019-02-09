const Base = require("./Base");

class VoiceChannel extends Base {
    constructor(client, data) {
        super(client, data);

        this.update(data);
    }

    update(data) {
        super.update(data);

        if(data.guild_id) this.guildID = data.guild_id;
        if(data.hasOwnProperty("position")) this.position = data.position;
        if(data.permission_overwrites) this.overwrites = data.permission_overwrites;
        if(data.name) this.name = data.name;
        if(data.bitrate) this.bitrate = data.bitrate;
        if(data.hasOwnProperty("user_limit")) this.userLimit = data.user_limit;
        if(data.hasOwnProperty("parent_id")) this.categoryID = data.parent_id;
        if(data.last_pin_timestamp) this.lastPin = data.last_pin_timestamp;
    }
}

module.exports = VoiceChannel;
