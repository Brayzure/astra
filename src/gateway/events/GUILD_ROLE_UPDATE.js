module.exports = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    const role = guild.roles.get(data.role.id);
    const oldRole = role.clone();
    role.update(data.role);
    // Gateway sends @everyone role updates when you update
    // any other role, with no changes to the role. Let's not
    // emit if the role didn't actually change
    if(role.name === "@everyone") {
        let update = false;
        for(const prop in role) {
            if(prop !== "data" && role.hasOwnProperty(prop) && role[prop] !== oldRole[prop]) {
                update = true;
            }
        }
        if(!update) return;
    }
    client.emit("roleUpdate", guild, role, oldRole);
}
