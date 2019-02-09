const Message = require("../../structures/Message");

module.exports = (client, data) => {
    const message = new Message(client, data);
    client.messages.set(message.id, message);
    const messageCacheKeys = Array.from(client.messages.keys());
    if(messageCacheKeys.length > client.textChannelCount * 100) {
        const toDelete = messageCacheKeys.length - client.textChannelCount * 100;
        for(let i = 0; i < toDelete; i++) {
            client.messages.delete(messageCacheKeys[i]);
        }
    }
    client.emit("messageCreate", message);
}
