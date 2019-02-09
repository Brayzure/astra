class Base {
    constructor(client, data) {
        this._client = client;
        if(data) this.id = data.id;
    }

    update(data) {
        if(this._client.packetData) this.data = data;
    }

    clone() {
        const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        return copy;
    }
}

module.exports = Base;
