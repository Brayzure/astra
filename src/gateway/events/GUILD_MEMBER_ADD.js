const Member = require("../../structures/Member");

module.exports = (client, data) => {
    data.id = data.user.id;
    const member = new Member(client, data);
    const guild = client.guilds.get(data.guild_id);
    guild.memberCount++;
    guild.members.set(member.id, member);
    client.emit("guildMemberAdd", member.guild, member);
}
