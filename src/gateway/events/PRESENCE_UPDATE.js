const User = require("../../structures/User");
const Member = require("../../structures/Member");

module.exports = (client, data) => {
    let user = client.users.get(data.user.id);
    if(!user) {
        user = new User(client, data.user);
        client.users.set(data.user.id, user);
        client.emit("userUpdate", user, null);
        return;
    }
    // Data matches, presence update
    if(compareUserObjectToData(user, data)) {
        const guild = client.guilds.get(data.guild_id);
        // Guild either isn't available or hasn't been cached yet
        if(!guild) return;
        const member = guild.members.get(data.user.id);
        let oldMember = null;
        if(!member) {
            guild.members.set(data.user.id, new Member(client, data));
        }
        else {
            oldMember = member.clone();
            oldMember.presence = member.presence.clone();
            member.update(data);
        }
        client.emit("presenceUpdate", member, oldMember);
    }
    // Data doesn't match, user update
    else {
        const oldUser = user.clone();
        user.update(data.user);
        client.emit("userUpdate", user, oldUser);
    }
}

function compareUserObjectToData(object, data) {
    if(data.username && object.username !== data.username
        || data.discriminator && object.discriminator !== data.discriminator
        || data.avatar && object.avatar !== data.avatar)
        return false;
    return true;
}
