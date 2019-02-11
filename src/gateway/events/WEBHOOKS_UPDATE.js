module.exports = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    const channel = client.channels.get(data.channel_id);
    client.emit("webhookUpdate", guild, channel);
}
