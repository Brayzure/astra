const Base = require("./Base");

class VoiceState extends Base {
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

    get member() {
        if(!this.guild) return undefined;
        if(this._cachedMember) return this._cachedMember;
        const member = this.guild.members.get(this.userID);
        if(member) this._cachedMember = member;
        return member;
    }

    update(data) {
        super.update(data);
        
        this.guildID = data.guild_id || this.guildID;
        this.channelID = data.channel_id;
        this.userID = data.user_id;
        this.sessionID = data.session_id;
        this.deaf = data.deaf;
        this.mute = data.mute;
        this.suppress = data.suppress;
        this.selfDeaf = data.self_deaf;
        this.selfMute = data.self_mute;
    }
}

module.exports = VoiceState;
