const Member = require("../../structures/Member");

module.exports = (client, data) => {
    data.id = data.user.id;
    let guild = client.guilds.get(data.guild_id);
    guild.memberCount--;
    let member = guild.members.get(data.id);
    if(member) {
        guild.members.delete(data.id);
    }
    else {
        member = new Member(client, data);
    }
    client.emit("guildMemberRemove", guild, member);
}
