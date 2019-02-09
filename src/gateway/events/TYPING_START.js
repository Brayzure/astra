module.exports = (client, data) => {
    const channel = client.channels.get(data.channel_id);
    if(!channel) return;
    let user = client.users.get(data.user_id) || data.user_id;
    client.emit("typingStart", channel, user, data.timestamp);
}
