const EventEmitter = require("events");

const RequestHandler = require("./rest/RequestHandler");
const Endpoints = require("./rest/Endpoints");
const Shard = require("./gateway/Shard");
const { Sequence } = require("./rest/RateLimiter");

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

    async getGateway(bot=true) {
        const gateway = await this.requestHandler.request("GET", Endpoints.GATEWAY_BOT);
        return gateway;
    }
}

module.exports = GatewayClient;
