const Channel = require("../../structures/Channel");

module.exports = (client, data) => {
    let channel = client.channels.get(data.id);
    if(!channel) {
        channel = Channel.AutoChannel(client, data);
        client.channels.set(channel.id, channel);
    }
    else {
        let oldChannel = channel.clone();
        channel.update(data);
        client.emit("channelUpdate", channel, oldChannel);
    }
}
