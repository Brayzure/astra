const Base = require("./Base");
const TextChannel = require("./TextChannel");
const VoiceChannel = require("./VoiceChannel");
const CategoryChannel = require("./CategoryChannel");

class Channel extends Base {
    constructor(client, data) {
        super(client, data);

        this.update(data);
    }

    get guild() {
        if(this.guildID) return this.client.guilds.get(this.guildID);
        return undefined;
    }

    update(data) {
        super.update(data);
        
        if(data.hasOwnProperty("type")) this.type = data.type;
    }
}

// Returns the appropriate channel instance
function AutoChannel(client, data) {
    if(data.type === 4) return new CategoryChannel(client, data);
    else if(data.type === 2) return new VoiceChannel(client, data);
    else return new TextChannel(client, data);
}

module.exports = Channel;
module.exports.AutoChannel = AutoChannel;
