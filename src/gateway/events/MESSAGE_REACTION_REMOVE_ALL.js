const Message = require("../../structures/Message");

// TODO: Remove reaction from message
module.exports = (client, data) => {
    let message = client.messages.get(data.message_id);
    if(!message) {
        message = {
            id: data.message_id,
            channelID: data.channel_id
        };
        if(data.guild_id) {
            message.guildID = data.guild_id;
            const guild = client.guilds.get(message.guildID);
            if(guild) message.guild = guild;
        }
        const channel = client.channels.get(message.channelID);
        if(channel) message.channel = channel;
    }
    client.emit("reactionRemoveAll", message);
}
