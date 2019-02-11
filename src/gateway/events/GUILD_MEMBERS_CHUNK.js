const Member = require("../../structures/Member");

module.exports = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    console.log(`Received ${data.members.length} members for ${guild.name}`);
    for(const member of data.members) {
        let m = guild.members.get(member.user.id);
        if(m) {
            m.update(member);
        }
        else {
            member.guild_id = data.guild_id;
            m = new Member(client, member);
            m.resolveRoles(guild);
            guild.members.set(member.id, member);
        }
    }
}
