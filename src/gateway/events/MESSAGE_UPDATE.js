const Message = require("../../structures/Message");

module.exports = (client, data) => {
    let message = client.messages.get(data.id);
    if(message) {
        let oldMessage = message.clone();
        message.update(data);
        client.emit("messageUpdate", message, oldMessage);
    }
}
