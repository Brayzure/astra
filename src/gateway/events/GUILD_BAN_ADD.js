const User = require("../../structures/User");

module.exports = (client, data) => {
    let guild = client.guilds.get(data.guild_id) || { id: data.guild_id };
    let user = client.users.get(data.user.id) || new User(client, data.user);
    let member = guild.members.get(user.id);
    client.emit("guildBanAdd", guild, user, member);
}
