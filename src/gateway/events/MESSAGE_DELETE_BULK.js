module.exports = (client, data) => {
    let messages = [];
    for(const id of data.ids) {
        const message = client.messages.get(id);
        if(message) messages.push(message);
        else messages.push({ id });
    }
    const channel = client.channels.get(data.channel_id);
    const guild = client.guilds.get(data.guild_id);
    client.emit("messageDeleteBulk", messages, channel, guild);
}
