const Channel = require("../../structures/Channel");

module.exports = (client, data) => {
    let channel = client.channels.get(data.id);
    // Maybe got event before all guilds were initialized?
    if(!channel) return;
    client.channels.delete(channel.id);
    client.emit("channelDelete", channel);
}
