module.exports = (client, data) => {
    const channel = client.channels.get(data.channel_id);
    channel.update(data);
    client.emit("channelPinsUpdate", channel);
}
