const Base = require("./Base");

class TextChannel extends Base {
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
        if(data.topic) this.topic = data.topic;
        if(data.hasOwnProperty("nsfw")) this.nsfw = data.nsfw;
        if(data.hasOwnProperty("last_message_id")) this.lastMessageID = data.last_message_id;
        if(data.hasOwnProperty("rate_limit_per_user")) this.rateLimit = data.rate_limit_per_user;
        if(data.recipients) this.recipients = data.recipients;
        if(data.hasOwnProperty("icon")) this.iconHash = data.icon;
        if(data.owner_id) this.ownerID = data.owner_id;
        if(data.application_id) this.applicationID = data.application_id;
        if(data.hasOwnProperty("parent_id")) this.categoryID = data.parent_id;
        if(data.last_pin_timestamp) this.lastPin = data.last_pin_timestamp;
    }
}

module.exports = TextChannel;
