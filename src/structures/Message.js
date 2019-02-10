const Base = require("./Base");
const User = require("../structures/User");
const Member = require("../structures/Member");

class Message extends Base {
    constructor(client, data) {
        super(client, data);

        this.update(data);
    }

    get isFromWebhook() {
        return !!this.webhookID;
    }

    get isPrivate() {
        return !!this.guildID;
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
        if(this._cachedMember) return this._cachedMember;
        if(!this.guild) return null;
        const member = this.guild.members.get(this.id);
        if(member) this._cachedMember = member;
        return member;
    }

    update(data) {
        super.update(data);
        
        // Only do certain checks if it's the first time updating.
        // Certain properties, like channel ID, guild ID, and author
        // never change.
        if(!this.channelID) {
            this.channelID = data.channel_id;
            if(data.guild_id) this.guildID = data.guild_id
            // Only make an author if the message wasn't made by a webhook
            if(!data.webhook_id) {
                let user = this._client.users.get(data.author.id);
                if(!user) {
                    user = new User(this._client, data.author);
                    this._client.users.set(user.id, user);
                }
                this.author = user;
            }
            else {
                this.webhookID = data.webhook_id;
            }
            // Only make a member property if we have an author
            if(this.author && data.member && this.guild) {
                let member = this.guild.members.get(this.author.id);
                if(!member) {
                    member = new Member(this._client, data.member);
                }
            }
            this.timestamp = data.timestamp;
            this.type = data.type;
            if(data.nonce) this.nonce = data.nonce;
        }
        // Now for everything else!
        this.content = data.content || this.content;
        this.editedTimestamp = data.edited_timestamp || this.edited_timestamp;
        this.tts = data.tts || this.tts;
        this.mentionsEveryone = data.mention_everyone || this.mentionsEveryone;
        this.pinned = data.pinned;
        this.activity = data.activity || this.activity;
        this.application = data.application || this.application;
        if(data.mentions) {
            this.mentions = [];
            for(const mention of data.mentions) {
                let user = this._client.users.get(mention.id);
                if(!user) {
                    user = new User(this._client, mention);
                    this._client.users.set(user.id, user);
                }
                this.mentions.push(user);
            }
        }
        if(data.mention_roles) {
            this.roleMentions = [];
            for(const roleMention of data.mention_roles) {
                const role = this.guild.roles.get(roleMention);
                this.roleMentions.push(role);
            }
        }
        this.attachments = data.attachements;
        this.embeds = data.embeds;
        // TODO: Store reactions better!
        this.reactions = data.reactions || this.reactions;
    }
}

module.exports = Message;
