const Guild = require("../../structures/Guild");

module.exports = (client, data) => {
    let g = client.unavailableGuilds.get(data.id);
    if(g && g instanceof Guild) {
        g.update(data);
    }
    else {
        g = new Guild(client, data);
    }
    g.members.forEach(m => m.resolveRoles(g));
    client.guilds.set(data.id, g);
    if(client.unavailableGuilds.has(g.id)) {
        const unavailableGuild = client.unavailableGuilds.has(g.id);
        client.unavailableGuilds.delete(g.id);
        if(unavailableGuild instanceof Guild) {
            client.emit("guildAvailable", g);
        }
        else {
            client.emit("guildReady", g);
        }
    }
    else {
        client.emit("guildCreate", g);
    }
}
