const Base = require("./Base");
const Channel = require("./Channel");
const TextChannel = require("./TextChannel");
const VoiceChannel = require("./VoiceChannel");
const CategoryChannel = require("./CategoryChannel");
const Role = require("./Role");
const User = require("./User");
const Member = require("./Member");

class Guild extends Base {
    constructor(client, data) {
        super(client, data);

        this.channels = new Map();
        this.roles = new Map();
        this.members = new Map();

        this.update(data);
    }

    get owner() {
        return this.client.users.get(this.ownerID);
    }

    get afkChannel() {
        return this.channels.get(this.afkChannelID);
    }

    update(data) {
        super.update(data);

        if(data.name) this.name = data.name;
        if(data.hasOwnProperty("icon")) this.iconHash = data.icon;
        if(data.hasOwnProperty("splash")) this.splashHash = data.splash;
        if(data.owner_id) this.ownerID = data.owner_id;
        if(data.hasOwnProperty("owner")) this.clientIsOwner = data.owner;
        if(data.hasOwnProperty("permissions")) this.clientPermissions = data.permissions;
        if(data.region) this.region = data.region;
        if(data.hasOwnProperty("afk_channel_id")) this.afkChannelID = data.afk_channel_id;
        if(data.afk_timeout) this.afkTimeout = data.afk_timeout;
        if(data.hasOwnProperty("embed_enabled")) {
            this.embedEnabled = data.embed_enabled;
            if(data.hasOwnProperty("embed_channel_id")) this.embedChannelID = data.embed_channel_id;
        }
        if(data.hasOwnProperty("verification_level")) this.verificationLevel = data.verification_level;
        if(data.hasOwnProperty("default_message_notifications")) this.defaultMessageNotifications = data.default_message_notifications;
        if(data.hasOwnProperty("explicit_content_filter")) this.explicitContentFilter = data.explicit_content_filter;
        if(data.roles) {
            for(const role of data.roles) {
                this.roles.set(role.id, new Role(this._client, role));
            }
        }
        if(data.emojis) this.emojis = data.emojis;
        if(data.features) this.features = data.features;
        if(data.hasOwnProperty("mfa_level")) this.mfaLevel = data.mfa_level;
        if(data.hasOwnProperty("application_id")) this.applicationID = data.application_id;
        if(data.hasOwnProperty("widget_enabled")) {
            this.widgetEnabled = data.widget_enabled;
            if(data.hasOwnProperty("widget_channel_id")) this.widgetChannelID = data.widget_channel_id;
        }
        if(data.hasOwnProperty("systme_channel_id")) this.systemChannelID = data.system_channel_id;
        if(data.joined_at) this.joinedAt = data.joined_at;
        if(data.hasOwnProperty("large")) this.large = data.large;
        if(data.member_count) this.memberCount = data.member_count;
        if(data.members) {
            for(const member of data.members) {
                let user = this._client.users.get(member.user.id);
                if(user) {
                    user.update(member.user);
                }
                else {
                    user = new User(this._client, member.user);
                    this._client.users.set(user.id, user);
                }

                member.guild_id = this.id;
                member.id = user.id;
                this.members.set(user.id, new Member(this._client, member));
            }
        }
        if(data.voice_states) {
            for(const state of data.voice_states) {
                const member = this.members.get(state.user_id);
                if(member) member.updateVoiceState(state);
            }
        }
        if(data.channels) {
            for(const channel of data.channels) {
                channel.guild_id = this.id;
                let newChannel = Channel.AutoChannel(this._client, channel);
                if(newChannel instanceof TextChannel && !this.channels.has(newChannel.id)) this._client.textChannelCount++;
                this.channels.set(newChannel.id, newChannel);
                this._client.channels.set(newChannel.id, newChannel);
            }
        }
        if(data.presences) {
            for(const presence of data.presences) {
                this.members.get(presence.user.id).updatePresence(presence);
            }
        }
    }
}

module.exports = Guild;
