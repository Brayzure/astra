const Role = require("../../structures/Role");

module.exports = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    const role = new Role(client, data.role);
    guild.roles.set(role.id, role);
    client.emit("roleCreate", guild, role);
}
