module.exports = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    const oldGuild = guild.clone();
    guild.update(data);
    client.emit("guildEmojisUpdate", guild.emojis, oldGuild.emojis);
}
