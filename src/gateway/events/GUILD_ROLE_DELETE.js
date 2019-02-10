module.exports = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    const role = guild.roles.get(data.role_id);
    guild.roles.delete(role.id);
    client.emit("roleDelete", guild, role);
}
