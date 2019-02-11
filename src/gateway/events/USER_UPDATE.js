const User = require("../../structures/User");

module.exports = (client, data) => {
    let user = client.users.get(data.id);
    let oldUser;
    if(user) {
        oldUser = user.clone();
        user.update();
    }
    else {
        user = new User(client, data);
        client.users.set(user.id, user);
    }
    client.emit("userUpdate", user, oldUser);
}
