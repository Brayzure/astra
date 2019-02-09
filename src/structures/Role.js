const Base = require("./Base");

class Role extends Base {
    constructor(client, data) {
        super(client, data);

        this.update(data);
    }

    update(data) {
        super.update(data);
        
        if(data.hasOwnProperty("position")) this.position = data.position;
        if(data.hasOwnProperty("permissions")) this.permissions = data.permissions;
        if(data.name) this.name = data.name;
        if(data.hasOwnProperty("mentionable")) this.mentionable = data.mentionable;
        if(data.hasOwnProperty("managed")) this.managed = data.managed;
        if(data.hasOwnProperty("hoist")) this.hoisted = data.hoist;
        if(data.hasOwnProperty("color")) this.color = data.color;
    }
}

module.exports = Role;
