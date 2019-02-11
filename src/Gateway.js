const EventEmitter = require("events");

const RequestHandler = require("./rest/RequestHandler");
const Endpoints = require("./rest/Endpoints");
const { Sequence } = require("./rest/RateLimiter");
const Shard = require("./gateway/Shard");

const Channel = require("./structures/Channel");
const Message = require("./structures/Message");

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

    async getGateway(bot=true) {
        const gateway = await this.requestHandler.request("GET", Endpoints.GATEWAY_BOT);
        return gateway;
    }
}

module.exports = GatewayClient;
