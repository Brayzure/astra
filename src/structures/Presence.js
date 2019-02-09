const Base = require("./Base");

class Presence extends Base {
    constructor(client, data) {
        super(data);
        this._client = client;
        
        this.update(data);
    }

    get user() {
        if(this._cachedUser) return _cachedUser;
        const user = this._client.users.get(this.user_id);
        if(user) this._cachedUser = user;
        return user;
    }

    get guild() {
        if(this._cachedGuild) return _cachedGuild;
        const guild = this._client.guilds.get(this.guild_id);
        if(guild) this._cachedGuild = guild;
        return guild;
    }

    update(data) {
        super.update(data);
        
        if(!this.user_id && data.user) {
            this.user_id = data.user.id;
        }
        if(!this.guild_id && data.guild_id) this.guild_id = data.guild_id;
        this.status = data.status || this.status;
        if(data.hasOwnProperty("game")) this.game = data.game;
        this.activities = data.activities || this.activities;
        this.clientStatus = Object.assign({}, { web: "offline", desktop: "offline", mobile: "offline" }, data.client_status);
    }
}

module.exports = Presence;
