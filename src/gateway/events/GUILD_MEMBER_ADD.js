const Member = require("../../structures/Member");

module.exports = (client, data) => {
    data.id = data.user.id;
    const member = new Member(client, data);
    client.guilds.get(data.guild_id).members.set(member.id, member);
    client.emit("guildMemberAdd", member.guild, member);
}
