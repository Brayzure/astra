module.exports = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    client.emit("guildIntegrationsUpdate", guild);
}
