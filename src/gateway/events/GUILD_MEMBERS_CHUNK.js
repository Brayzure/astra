const Member = require("../../structures/Member");

module.exports = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    for(const member of data.members) {
        let m = guild.members.get(member.user.id);
        if(m) {
            m.update(member);
        }
        else {
            member.guild_id = data.guild_id;
            member.id = member.user.id;
            m = new Member(client, member);
            m.resolveRoles(guild);
            guild.members.set(m.id, m);
        }
    }
}
