const Guild = require("./Guild");
const Channel = require("./Channel");

class Invite {
    constructor(client, data) {
        this._client = client;

        this.update(data);
    }

    update(data) {
        this.code = data.code;
        this.channel = Channel.AutoChannel(this._client, data.channel);
        if(data.guild) this.guild = new Guild(this._client, data.guild);
        if(data.hasOwnProperty("approximate_presence_count")) this.onlineMembers = data.approximate_presence_count;
        if(data.hasOwnProperty("approximate_member_count")) this.totalMembers = data.approximate_member_count;
    }
}

module.exports = Invite;
