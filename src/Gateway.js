const EventEmitter = require("events");

const RequestHandler = require("./rest/RequestHandler");
const Endpoints = require("./rest/Endpoints");
const { Sequence } = require("./rest/RateLimiter");
const Shard = require("./gateway/Shard");

const Channel = require("./structures/Channel");
const Message = require("./structures/Message");
const User = require("./structures/User");
const Invite = require("./structures/Invite");
const Guild = require("./structures/Guild");
const Member = require("./structures/Member");
const Role = require("./structures/Role");

class GatewayClient extends EventEmitter {
    constructor(token, options={}) {
        super();
        this.token = token || process.env.DISCORD_BOT_TOKEN;
        if(!this.token) throw new Error("No token supplied");
        this.fullToken = "Bot " + this.token;

        this.requestHandler = new RequestHandler(this.fullToken);
        this.identifyRateLimiter = new Sequence(1, 2);
        this.shardCount = options.shardCount || 1;

        this.shards = new Map();
        this.guilds = new Map();
        this.unavailableGuilds = new Map();
        this.users = new Map();
        this.channels = new Map();
        this.messages = new Map();

        this.textChannelCount = 0;

        this.options = options;
    }

    async spawnShards() {
        const { url } = await this.getGateway();
        this.gatewayURL = url;
        for(let i = 0; i < this.shardCount; i++) {
            this.shards.set(i, new Shard(this, i, { shardCount: this.shardCount }));
        }
        this.shards.forEach(s => s.connect());
    }

    async getChannel(id) {
        const channel = await this.requestHandler.request("GET", Endpoints.CHANNEL(id));
        return Channel.AutoChannel(this, channel);
    }

    async editChannel(id, options={}) {
        const channel = await this.requestHandler.request("PATCH", Endpoints.CHANNEL(id), options);
        return this.channels.get(id) || Channel.AutoChannel(this, channel);
    }

    async deleteChannel(id) {
        const channel = await this.requestHandler.request("DELETE", Endpoints.CHANNEL(id));
        return this.channels.get(id) || Channel.AutoChannel(this, channel);
    }

    async getChannelMessages(id, options={}) {
        const messages = await this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGES(id), options);
        let messageArray = [];
        for(const message of messages) {
            messageArray.push(new Message(this, message));
        }
        return messageArray;
    }

    async getChannelMessage(channelID, messageID) {
        const message = await this.requestHandler.request("GET", Endpoints.CHANNEL_MESSAGE(channelID, messageID));
        return new Message(this, message);
    }

    async createMessage(channelID, content, options={}) {
        options.content = content;
        const message = await this.requestHandler.request("POST", Endpoints.CHANNEL_MESSAGES(channelID), options);
        return new Message(this, message);
    }

    async createReaction(channelID, messageID, emoji) {
        if(decodeURIComponent(emoji) === emoji) emoji = encodeURIComponent(emoji);
        await this.requestHandler.request("PUT", Endpoints.CHANNEL_REACTION(channelID, messageID, emoji));
    }

    async deleteReaction(channelID, messageID, emoji, user="@me") {
        if(decodeURIComponent(emoji) === emoji) emoji = encodeURIComponent(emoji);
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_REACTION(channelID, messageID, emoji, user));
    }

    async getReactions(channelID, messageID, emoji, options={}) {
        if(decodeURIComponent(emoji) === emoji) emoji = encodeURIComponent(emoji);
        const users = await this.requestHandler.request("GET", Endpoints.CHANNEL_REACTIONS(channelID, messageID, emoji), options);
        const userArray = [];
        for(const user of users) {
            userArray.push(new User(this, user));
        }
        return userArray;
    }

    async deleteAllReactions(channelID, messageID) {
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_REACTIONS_DELETE(channelID, messageID));
    }

    async editMessage(channelID, messageID, options={}) {
        if(typeof options === "string") options = { content: options };
        const message = await this.requestHandler.request("PATCH", Endpoints.CHANNEL_MESSAGE(channelID, messageID), options);
        return new Message(this, message);
    }

    async deleteMessage(channelID, messageID) {
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_MESSAGE(channelID, messageID));
    }

    // TODO: Preemptively check if the request is valid
    // 2-100 messages, invalid IDs count, duplicate IDs do not
    // Request fails if any messages are older than 2 weeks
    async deleteMessagesBulk(channelID, messages) {
        const options = {
            messages
        }
        await this.requestHandler.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), options);
    }

    async editChannelOverwrite(channelID, overwriteID, options={}) {
        await this.requestHandler.request("PUT", Endpoints.CHANNEL_PERMISSIONS(channelID, overwriteID), options);
    }

    async getInvites(channelID) {
        const invites = await this.requestHandler.request("GET", Endpoints.CHANNEL_INVITES(channelID));
        const inviteArray = [];
        for(const invite of invites) {
            inviteArray.push(new Invite(this, invite));
        }
        return inviteArray;
    }

    async createInvite(channelID, options={}) {
        const invite = await this.requestHandler.request("POST", Endpoints.CHANNEL_INVITES(channelID), options);
        return new Invite(this, invite);
    }

    async deleteChannelOverwrite(channelID, overwriteID) {
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_PERMISSIONS(channelID, overwriteID));
    }

    async startTyping(channelID) {
        await this.requestHandler.request("POST", Endpoints.CHANNEL_TYPING(channelID));
    }

    async getChannelPins(channelID) {
        const pins = await this.requestHandler.request("GET", Endpoints.CHANNEL_PINS(channelID));
        const messageArray = [];
        for(const message of pins) {
            messageArray.push(new Message(this, message));
        }
        return messageArray;
    }

    async pinMessage(channelID, messageID) {
        await this.requestHandler.request("PUT", Endpoints.CHANNEL_PIN(channelID, messageID));
    }

    async unpinMessage(channelID, messageID) {
        await this.requestHandler.request("DELETE", Endpoints.CHANNEL_PIN(channelID, messageID));
    }

    async createGuild(options={}) {
        const guild = await this.requestHandler.request("POST", Endpoints.GUILDS, options);
        return new Guild(this, guild);
    }

    async editGuild(guildID, options={}) {
        const guild = await this.requestHandler.request("PATCH", Endpoints.GUILD(guildID), options);
        return new Guild(this, guild);
    }

    async deleteGuild(guildID) {
        await this.requestHandler.request("DELETE", Endpoints.GUILD(guildID));
    }

    async getChannels(guildID) {
        const channels = await this.requestHandler.request("GET", Endpoints.GUILD_CHANNELS(guildID));
        const channelArray = [];
        for(const channel of channels) {
            channelArray.push(Channel.AutoChannel(this, channel));
        }
        return channelArray;
    }

    async createChannel(guildID, options={}) {
        const channel = await this.requestHandler.request("POST", Endpoints.GUILD_CHANNELS(guildID), options);
        return new Channel.AutoChannel(this, channel);
    }

    async editChannelPosition(guildID, channels=[]) {
        await this.requestHandler.request("PATCH", Endpoints.GUILD_CHANNELS(guildID), channels);
    }

    async getMember(guildID, memberID) {
        const member = await this.requestHandler.request("GET", Endpoints.GUILD_MEMBER(guildID, memberID));
        member.guild_id = guildID;
        member.id = memberID;
        const newMember = new Member(this, member);
        delete newMember.presence;
        return newMember;
    }

    async getMembers(guildID, options={}) {
        const members = await this.requestHandler.request("GET", Endpoints.GUILD_MEMBERS(guildID), options);
        console.log(members.length);
        const memberArray = [];
        for(const member of members) {
            member.guild_id = guildID;
            member.id = member.user.id;
            const newMember = new Member(this, member);
            delete newMember.presence;
            memberArray.push(newMember);
        }
        return memberArray;
    }

    async editMember(guildID, memberID, options={}) {
        await this.requestHandler.request("PATCH", Endpoints.GUILD_MEMBER(guildID, memberID), options);
    }

    async editNickname(guildID, nick) {
        await this.requestHandler.request("PATCH", Endpoints.GUILD_NICKNAME(guildID), { nick });
    }

    async addRole(guildID, memberID, roleID) {
        await this.requestHandler.request("PUT", Endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID));
    }

    async removeRole(guildID, memberID, roleID) {
        await this.requestHandler.request("DELETE", Endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID));
    }

    async kickMember(guildID, memberID) {
        await this.requestHandler.request("DELETE", Endpoints.GUILD_MEMBER(guildID, memberID));
    }

    async getBans(guildID) {
        const bans = await this.requestHandler.request("GET", Endpoints.GUILD_BANS(guildID));
        for(const ban of bans) {
            ban.user = new User(this, ban.user);
        }
        return bans;
    }

    async getBan(guildID, memberID) {
        const ban = await this.requestHandler.request("GET", Endpoints.GUILD_BAN(guildID, memberID));
        ban.user = new User(this, ban.user);
        return ban;
    }

    async banMember(guildID, memberID, options={}) {
        await this.requestHandler.request("PUT", Endpoints.GUILD_BAN(guildID, memberID), options);
    }

    async unbanMember(guildID, memberID) {
        await this.requestHandler.request("DELETE", Endpoints.GUILD_BAN(guildID, memberID));
    }

    async getGuildRoles(guildID) {
        const roles = await this.requestHandler.request("GET", Endpoints.GUILD_ROLES(guildID));
        const roleArray = [];
        for(const role of roles) {
            role.guild_id = guildID;
            roleArray.push(new Role(this, role));
        }
        return roleArray;
    }

    async createRole(guildID, options={}) {
        const role = await this.requestHandler.request("POST", Endpoints.GUILD_ROLES(guildID), options);
        return new Role(this, role);
    }

    async editRolePositions(guildID, options=[]) {
        const roles = await this.requestHandler.request("PATCH", Endpoints.GUILD_ROLES(guildID), options);
        const roleArray = [];
        for(const role of roles) {
            role.guild_id = guildID;
            roleArray.push(new Role(this, role));
        }
        return roles;
    }

    async editRole(guildID, roleID, options={}) {
        const role = await this.requestHandler.request("PATCH", Endpoints.GUILD_ROLE(guildID, roleID), options);
        role.guild_id = guildID;
        return new Role(this, role);
    }

    async deleteRole(guildID, roleID) {
        await this.requestHandler.request("DELETE", Endpoints.GUILD_ROLE(guildID, roleID));
    }

    async getPruneCount(guildID, days) {
        const pruneCount = await this.requestHandler.request("GET", Endpoints.GUILD_PRUNE(guildID), { days });
        return pruneCount.pruned;
    }

    async prune(guildID, days, computePruneCount=true) {
        const pruneCount = await this.requestHandler.request("GET", Endpoints.GUILD_PRUNE(guildID), { days, compute_prune_count: computePruneCount });
        return pruneCount.pruned;
    }

    async getVoiceRegions() {
        const regions = await this.requestHandler.request("GET", Endpoints.VOICE_REGIONS);
        return regions;
    }

    async getGuildInvites(guildID) {
        const invites = await this.requestHandler.request("GET", Endpoints.GUILD_INVITES(guildID));
        const inviteArray = [];
        for(const invite of invites) {
            inviteArray.push(new Invite(this, invite));
        }
        return inviteArray;
    }

    async getIntegrations(guildID) {
        const integrations = await this.requestHandler.request("GET", Endpoints.GUILD_INTEGRATIONS(guildID));
        return integrations;
    }

    async addIntegration(guildID, options={}) {
        await this.requestHandler.request("POST", Endpoints.GUILD_INTEGRATIONS(guildID), options);
    }

    async editIntegration(guildID, intID, options={}) {
        await this.requestHandler.request("PATCH", Endpoints.GUILD_INTEGRATION(guildID, intID), options);
    }

    async deleteIntegration(guildID, intID) {
        await this.requestHandler.request("DELETE", Endpoints.GUILD_INTEGRATION(guildID, intID));
    }

    async syncIntegration(guildID, intID) {
        await this.requestHandler.request("POST", Endpoints.GUILD_INTEGRATION_SYNC(guildID, intID));
    }

    async getGuildEmbed(guildID) {
        const embed = await this.requestHandler.request("GET", Endpoints.GUILD_EMBED(guildID));
        return embed;
    }

    async editGuildEmbed(guildID, options={}) {
        const embed = await this.requestHandler.request("PATCH", Endpoints.GUILD_EMBED(guildID), options);
        return embed;
    }

    async getVanityCode(guildID) {
        const { code } = await this.requestHandler.request("GET", Endpoints.GUILD_VANITY(guildID));
        return code;
    }

    async getGateway(bot=true) {
        const gateway = await this.requestHandler.request("GET", Endpoints.GATEWAY_BOT);
        return gateway;
    }
}

module.exports = GatewayClient;
