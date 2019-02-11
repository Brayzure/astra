const RequestHandler = require("../rest/RequestHandler");
const Endpoints = require("../rest/Endpoints");

const OP_CODES = {
    DISPATCH: 0,
    HEARTBEAT: 1,
    IDENTIFY: 2,
    PRESENCE: 3,
    VOICE_STATE: 4,
    VOICE_PING: 5,
    RESUME: 6,
    RECONNECT: 7,
    REQUEST_MEMBERS: 8,
    INVALIDATE_SESSION: 9,
    HELLO: 10,
    HEARTBEACK_ACK: 11,
    GUILD_SYNC: 12
};

class DiscordWebsocket {
    constructor(client, shard, options={}) {
        this.shard = shard;
        this.encoding = options.encoding || "json";
        this._client = client;
        this.status = "closed";
        this.lastSequence = null;
        if(typeof window === "undefined") {
            this.Websocket = require("ws");
        }
        else {
            this.Websocket = WebSocket;
        }

        this.dispatchEvents = {};
        this.unhandledEvents = [];

        this.wsSet = new Set();
    }

    initialize() {
        const url = `${this._client.gatewayURL}/?v=${Endpoints.SUPPORTED_GATEWAY_VERSIONS[0]}&encoding=${this.encoding}`;
        this.ws = new this.Websocket(url);
        this.status = "open";
        this.ws.on("message", this.onEvent.bind(this));
        this.ws.on("close", this.onClose.bind(this));
    }

    sendPacket(opCode, payload) {
        const packet = { op: opCode, d: payload };
        this.ws.send(JSON.stringify(packet));
    }

    hello(packet) {
        this.heartbeatInterval = packet.d.heartbeat_interval;
        if(this.heartbeatLoop) clearInterval(this.heartbeatLoop);
        this.heartbeatLoop = setInterval(this.heartbeat.bind(this), this.heartbeatInterval);
        this.heartbeat();

        // Resume
        if(this.status === "paused") {
            this.resume();
        }
        // Identify
        else {
            this.identify();
        }
    }

    identify() {
        const payload = {
            token: this._client.fullToken,
            properties: {
                $os: "windows",
                $browser: "astra",
                $device: "astra"
            },
            compress: false,
            large_threshold: 250,
            shard: [ this.shard.id, this.shard.shardCount ]
        };
        this.sendPacket(OP_CODES.IDENTIFY, payload);
        //this.ws.send(JSON.stringify({ op: OP_CODES.IDENTIFY, d: payload }));
    }

    resume() {
        const payload = {
            seq: this.pausedSequence,
            token: this._client.fullToken,
            session_id: this.sessionID
        }
        this.sendPacket(OP_CODES.RESUME, payload);
    }

    reconnect() {
        this.status = "reconnecting";
        this.ws.close(1000);
    }

    invalidate(packet) {
        if(packet.d) {
            setTimeout(this.resume.bind(this), 5000);
        }
        else {
            setTimeout(this.identify.bind(this), 5000);
        }
    }

    pause() {
        this.status = "paused";
        clearInterval(this.heartbeatLoop);
        this.pausedSequence = this.lastSequence;
    }

    unpause() {
        delete this.pausedSequence;
    }

    ready(packet) {
        for(const guild of packet.d.guilds) {
            this._client.unavailableGuilds.set(guild.id, guild);
        }
        if(this._client.options.getAllMembers) {
            if(this.guildMembersChunkTimeout) clearTimeout(this.guildMembersChunkTimeout);
            this.requestGuildMembers();
        }
        const d = packet.d;
        this.sessionID = d.session_id;
        this.status = "ready";
        this._client.emit("ready");
    }

    requestGuildMembers() {
        let ids = [];
        for(const guild of this._client.guilds.values()) {
            if(!guild.chunked) {
                ids.push(guild.id);
                guild.chunked = true;
            }
        }
        if(ids.length) {
            const payload = {
                guild_id: ids,
                query: "",
                limit: 0
            };
            this.sendPacket(OP_CODES.REQUEST_MEMBERS, payload);
        }
        if(this._client.unavailableGuilds.size) {
            this.guildMembersChunkTimeout = setTimeout(this.requestGuildMembers.bind(this), 1000);
        }
    }

    heartbeat() {
        this.ws.send(JSON.stringify({ op: OP_CODES.HEARTBEAT, d: this.lastSequence }));
    }

    onClose(code, message) {
        this.ws.removeAllListeners();
        // Session is still valid, attempt to resume
        if(code !== 1000 && code !== 4006) {
            this.pause();
        }
        this.initialize();
    }

    onEvent(packet) {
        packet = JSON.parse(packet);
        if(packet.op === OP_CODES.HELLO) this.hello(packet);
        if(packet.op === OP_CODES.HEARTBEAT) this.heartbeat();
        if(packet.op === OP_CODES.INVALIDATE_SESSION) this.invalidate(packet);
        if(packet.op === OP_CODES.DISPATCH) {
            this.lastSequence = packet.s;
            switch(packet.t) {
                case "RESUMED":
                    this.unpause();
                    break;
                case "READY":
                    this.ready(packet);
                    break;
                // No special handling, check for a handler
                default:
                    if(this.dispatchEvents[packet.t]) {
                        this.dispatchEvents[packet.t](this._client, packet.d);
                    }
                    else {
                        try {
                            const event = require(`./events/${packet.t}`);
                            this.dispatchEvents[packet.t] = event;
                            event(this._client, packet.d);
                        }
                        catch (err) {
                            if(!this.unhandledEvents.includes(packet.t)) {
                                this.unhandledEvents.push(packet.t);
                                console.warn(`Unhandled event: ${packet.t}`);
                            }
                        }
                    }
            }
        }
    }
}

module.exports = DiscordWebsocket;
