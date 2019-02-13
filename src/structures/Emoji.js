const Base = require("./Base");

class Emoji extends Base {
    constructor(client, data) {
        super(client, data);

        this.update(data);
    }

    get user() {
        if(this._cachedUser) return this._cachedUser;
        const user = this._client.users.get(this.userID);
        if(user) this._cachedUser = user;
        return user;
    }

    update(data) {
        super.update(data);
        
        this.name = data.name;
        if(data.roles) this.roleIDs = data.roles;
        if(data.user) this.userID = data.user.id;
        if(data.hasOwnProperty("require_colons")) this.requiresColons = data.require_colons;
        if(data.hasOwnProperty("managed")) this.managed = data.managed;
        if(data.hasOwnProperty("animated")) this.animated = data.animated;
    }
}

module.exports = Emoji;
