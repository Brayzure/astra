module.exports = (client, data) => {
    let message = client.messages.get(data.id);
    if(message) {
        client.messages.delete(message.id);
        client.emit("messageDelete", message);
    }
}
