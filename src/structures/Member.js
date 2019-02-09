const Base = require("./Base");
const Presence = require("./Presence");
const VoiceState = require("./VoiceState");
const User = require("./User");

class Member extends Base {
    constructor(client, data) {
        super(client, data);

        this.roles = new Map();

        this.update(data);
    }

    get guild() {
        if(this._cachedGuild) return this._cachedGuild;
        const guild = this._client.guilds.get(this.guildID);
        if(guild) this._cachedGuild = guild;
        return guild;
    }

    get user() {
        if(this._cachedUser) return this._cachedUser;
        const user = this._client.users.get(this.id);
        if(user) this._cachedUser = user;
        return user;
    }

    update(data) {
        super.update(data);
        
        this.guildID = data.guild_id || this.guildID;
        const guild = this.guild;
        if(data.roles) {
            if(guild) {
                this.roles.clear();
                for(const role of data.roles) {
                    const r = guild.roles.get(role);
                    if(r) this.roles.set(r.id, r);
                }
            }
            this.roleIDs = data.roles;
        }
        if(data.user) {
            let user = this._client.users.get(data.user.id);
            if(!user) {
                user = new User(this._client, data.user);
                this._client.users.set(user.id, user);
            }
        }
        this.nick = data.nick;

        this.updatePresence(data);
    }

    updatePresence(data) {
        if(!this.presence) {
            this.presence = new Presence(this._client, data);
        }
        else {
            this.presence.update(data);
        }
    }

    updateVoiceState(data) {
        if(!this.voiceState) {
            this.voiceState = new VoiceState(this._client, data);
        }
        else {
            this.voiceState.update(data);
        }
    }

    // Most members are created when the initial GUILD_CREATE
    // is sent, meaning the Guild object you want to pull roles
    // from is not yet created. So, this method is called once
    // the Guild instance is created, and replaces Role IDs with
    // Role references
    resolveRoles(guild) {
        for(const role of this.roleIDs) {
            this.roles.set(role, guild.roles.get(role));
        }
    }
}

module.exports = Member;
