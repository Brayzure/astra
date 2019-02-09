const Base = require("./Base");

class User extends Base {
    constructor(client, data) {
        super(client, data);

        this.update(data);
    }

    update(data) {
        super.update(data);

        this.username = data.username || this.username;
        this.discriminator = data.discriminator || this.discriminator;
        this.avatar = data.avatar || this.avatar;
    }
}

module.exports = User;
