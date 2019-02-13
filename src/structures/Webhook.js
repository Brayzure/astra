const Base = require("./Base");

class Webhook extends Base {
    constructor(client, data) {
        super(client, data);

        this.update(data);
    }

    get guild() {
        if(this._cachedGuild) return this._cachedGuild;
        const guild = this._client.guilds.get(this.guildID);
        if(guild) this._cachedGuild = guild;
        return guild;
    }

    get channel() {
        if(this._cachedChannel) return this._cachedChannel;
        const channel = this._client.channels.get(this.channelID);
        if(channel) this._cachedChannel = channel;
        return channel;
    }

    get user() {
        if(this._cachedUser) return this._cachedUser;
        const user = this._client.users.get(this.userID);
        if(user) this._cachedUser = user;
        return user;
    }

    update(data) {
        super.update(data);
        
        this.channelID = data.channel_id;
        this.name = data.name;
        this.avatar = data.avatar;
        this.token = data.token;
        if(data.guild_id) this.guildID = data.guild_id;
        if(data.user) this.userID = data.user.id;
    }
}

module.exports = Webhook;
