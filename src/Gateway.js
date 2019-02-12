const EventEmitter = require("events");

const RequestHandler = require("./rest/RequestHandler");
const Endpoints = require("./rest/Endpoints");
const { Sequence } = require("./rest/RateLimiter");
const Shard = require("./gateway/Shard");

const Channel = require("./structures/Channel");
const Message = require("./structures/Message");
const User = require("./structures/User");
const Invite = require("./structures/Invite");

class GatewayClient extends EventEmitter {
    constructor(token, options={}) {
        super();
        this.token = token || process.env.DISCORD_BOT_TOKEN;
        if(!this.token) throw new Error("No token supplied");
        this.fullToken = "Bot " + this.token;

        this.requestHandler = new RequestHandler(this.fullToken);
        this.identifyRateLimiter = new Sequence(1, 2);
        this.shardCount = options.shardCount || 1;

        this.shards = new Map();
        this.guilds = new Map();
        this.unavailableGuilds = new Map();
        this.users = new Map();
        this.channels = new Map();
        this.messages = new Map();

        this.textChannelCount = 0;

        this.options = options;
    }

    async spawnShards() {
        const { url } = await this.getGateway();
        this.gatewayURL = url;
        for(let i = 0; i < this.shardCount; i++) {
            this.shards.set(i, new Shard(this, i, { shardCount: this.shardCount }));
        }
        this.shards.forEach(s => s.connect());
    }

    async getChannel(id) {
        const channel = await this.requestHandler.request("GET", Endpoints.CHANNEL(id));
        return Channel.AutoChannel(this, channel);
    }

    async editChannel(id, options={}) {
        const channel = await this.requestHandler.request("PATCH", Endpoints.CHANNEL(id), options);
        return this.channels.get(id) || Channel.AutoChannel(this, channel);
    }

    async deleteChannel(id) {
        const channel = await this.requestHandler.request("DELETE", Endpoints.CHANNEL(id));
        return this.channels.get(id) || Channel.AutoChannel(this, channel);
    }

    async getChannelMessages(id, options={}) {
        const messages = await this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGES(id), options);
        let messageArray = [];
        for(const message of messages) {
            messageArray.push(new Message(this, message));
        }
        return messageArray;
    }

    async getChannelMessage(channelID, messageID) {
        const message = await this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGE(channelID, messageID));
        return new Message(this, message);
    }

    async createMessage(channelID, content, options={}) {
        options.content = content;
        const message = await this.requestHandler.request("POST", Endpoints.CHANNEL_MESSAGES(channelID), options);
        return new Message(this, message);
    }

    async createReaction(channelID, messageID, emoji) {
        if(decodeURIComponent(emoji) === emoji) emoji = encodeURIComponent(emoji);
        await this.requestHandler.request("PUT", Endpoints.CHANNEL_REACTION(channelID, messageID, emoji));
    }

    async deleteReaction(channelID, messageID, emoji, user="@me") {
        if(decodeURIComponent(emoji) === emoji) emoji = encodeURIComponent(emoji);
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_REACTION(channelID, messageID, emoji, user));
    }

    async getReactions(channelID, messageID, emoji, options={}) {
        if(decodeURIComponent(emoji) === emoji) emoji = encodeURIComponent(emoji);
        const users = await this.requestHandler.request("GET", Endpoints.CHANNEL_REACTIONS(channelID, messageID, emoji), options);
        const userArray = [];
        for(const user of users) {
            userArray.push(new User(this, user));
        }
        return userArray;
    }

    async deleteAllReactions(channelID, messageID) {
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_REACTIONS_DELETE(channelID, messageID));
    }

    async editMessage(channelID, messageID, options={}) {
        if(typeof options === "string") options = { content: options };
        const message = await this.requestHandler.request("PATCH", Endpoints.CHANNEL_MESSAGE(channelID, messageID), options);
        return new Message(this, message);
    }

    async deleteMessage(channelID, messageID) {
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_MESSAGE(channelID, messageID));
    }

    // TODO: Preemptively check if the request is valid
    // 2-100 messages, invalid IDs count, duplicate IDs do not
    // Request fails if any messages are older than 2 weeks
    async deleteMessagesBulk(channelID, messages) {
        const options = {
            messages
        }
        await this.requestHandler.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), options);
    }

    async editChannelOverwrite(channelID, overwriteID, options={}) {
        await this.requestHandler.request("PUT", Endpoints.CHANNEL_PERMISSIONS(channelID, overwriteID), options);
    }

    async getInvites(channelID) {
        const invites = await this.requestHandler.request("GET", Endpoints.CHANNEL_INVITES(channelID));
        const inviteArray = [];
        for(const invite of invites) {
            inviteArray.push(new Invite(this, invite));
        }
        return inviteArray;
    }

    async createInvite(channelID, options={}) {
        const invite = await this.requestHandler.request("POST", Endpoints.CHANNEL_INVITES(channelID), options);
        return new Invite(this, invite);
    }

    async deleteChannelOverwrite(channelID, overwriteID) {
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_PERMISSIONS(channelID, overwriteID));
    }

    async startTyping(channelID) {
        await this.requestHandler.request("POST", Endpoints.CHANNEL_TYPING(channelID));
    }

    async getChannelPins(channelID) {
        const pins = await this.requestHandler.request("GET", Endpoints.CHANNEL_PINS(channelID));
        const messageArray = [];
        for(const message of pins) {
            messageArray.push(new Message(this, message));
        }
        return messageArray;
    }

    async pinMessage(channelID, messageID) {
        await this.requestHandler.request("PUT", Endpoints.CHANNEL_PIN(channelID, messageID));
    }

    async unpinMessage(channelID, messageID) {
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_PIN(channelID, messageID));
    }

    async getGateway(bot=true) {
        const gateway = await this.requestHandler.request("GET", Endpoints.GATEWAY_BOT);
        return gateway;
    }
}

module.exports = GatewayClient;
