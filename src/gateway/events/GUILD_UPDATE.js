module.exports = (client, data) => {
    const g = client.guilds.get(data.id);
    if(!g) return;
    const oldGuild = g.clone();
    g.update(data);
    client.emit("guildUpdate", g, oldGuild);
}
