const Websocket = require("./Websocket");

class Shard {
    constructor(client, id, options={}) {
        this._client = client;
        this.id = id;
        this.shardCount = options.shardCount;
    }

    connect() {
        this.ws = new Websocket(this._client, this);
        this.ws.initialize();
    }
}

module.exports = Shard;
