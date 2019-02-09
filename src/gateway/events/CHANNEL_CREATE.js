const Channel = require("../../structures/Channel");
const TextChannel = require("../../structures/TextChannel");

module.exports = (client, data) => {
    const channel = Channel.AutoChannel(client, data);
    client.channels.set(channel.id, channel);
    if(channel instanceof TextChannel) client.textChannelCount++;
    client.emit("channelCreate", channel);
}
