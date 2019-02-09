module.exports = (client, data) => {
    // Unsupported for now
    if(!data.guild_id) return;
    const guild = client.guilds.get(data.guild_id);
    const member = guild.members.get(data.user_id);
    if(!member) return;
    let oldVoiceState;
    if(member.voiceState) {
        oldVoiceState = member.voiceState.clone();
    }
    member.updateVoiceState(data);
    client.emit("voiceStateUpdate", member.voiceState, oldVoiceState);
}
