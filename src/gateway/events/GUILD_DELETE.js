module.exports = (client, data) => {
    const g = client.guilds.get(data.id);
    // Guild became unavailable before even being sent
    // by the READY event. READY sets guild as unavailable
    // anyway, so we can let that event handle it
    if(!g) return;
    client.guilds.delete(g.id);
    if(data.unavailable) {
        g.update(data);
        client.unavailableGuilds.set(g.id, g);
        client.emit("guildUnavailable", g);
    }
    else {
        client.emit("guildDelete", g);
    }
}
