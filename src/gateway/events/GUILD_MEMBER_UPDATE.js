const Member = require("../../structures/Member");

module.exports = (client, data) => {
    data.id = data.user.id;
    const guild = client.guilds.get(data.guild_id);
    let member = guild.members.get(data.id);
    let oldMember;
    if(!member) {
        member = new Member(client, data);
        guild.members.set(member.id, member);
    }
    else {
        oldMember = member.clone();
        oldMember.roles = new Map(member.roles);
        member.update(data);
    }
    client.emit("guildMemberUpdate", guild, member, oldMember);
}
