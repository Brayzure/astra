const Guild = require("../../structures/Guild");

module.exports = (client, data) => {
    const g = new Guild(client, data)
    g.members.forEach(m => m.resolveRoles(g));
    client.guilds.set(data.id, g);
}
