module.exports.HOST = "discordapp.com"
module.exports.BASE_URL = "/api";
module.exports.SUPPORTED_REST_VERSIONS = [ 6 ];
module.exports.SUPPORTED_GATEWAY_VERSIONS = [ 6 ];

module.exports.CDN_URL = "https://cdn.discordapp.com";

// OAUTH ENDPOINTS
module.exports.AUTHORIZE = "/oauth2/authorize";
module.exports.TOKEN = "/oauth2/token";
module.exports.REVOKE = "/oauth2/token/revoke";

// CDN ENDPOINTS
module.exports.CDN_EMOJI = (emojiID, type) => `/emojis/${emojiID}.${type}`;
module.exports.CDN_GUILD_ICON = (guildID, guildIcon, type) => `/icons/${guildID}/${guildIcon}.${type}`;
module.exports.CDN_GUILD_SPLASH = (guildID, guildSplash, type) => `/splashes/${guildID}/${guildSplash}.${type}`;
module.exports.CDN_DEFAULT_AVATAR = (discrim) => `/embed/avatars/${+discrim%5}.png`;
module.exports.CDN_AVATAR = (userID, userAvatar, type) => `/avatars/${userID}/${userAvatar}.${type}`;
module.exports.CDN_APP_ICON = (appID, appIcon, type) => `/app-icons/${appID}/${appIcon}.${type}`;
module.exports.CDN_APP_ASSET = (appID, appAsset, type) => `/app-assets/${appID}/${appAsset}.${type}`;

// AUDIT LOG ENDPOINTS
module.exports.AUDIT_LOG = (guildID) => `/guilds/${guildID}/audit-logs`;

// CHANNEL ENDPOINTS
module.exports.CHANNEL = (channelID) => `/channels/${channelID}`;
module.exports.CHANNEL_MESSAGES = (channelID) => `/channels/${channelID}/messages`;
module.exports.CHANNEL_MESSAGE = (channelID, messageID) => `/channels/${channelID}/messages/${messageID}`;
module.exports.CHANNEL_REACTION = (channelID, messageID, emoji, user="@me") => `/channels/${channelID}/messages/${messageID}/reactions/${emoji}/${user}`;
module.exports.CHANNEL_REACTIONS = (channelID, messageID, emoji) => `/channels/${channelID}/messages/${messageID}/reactions/${emoji}`;
module.exports.CHANNEL_REACTIONS_DELETE = (channelID, messageID) => `/channels/${channelID}/messages/${messageID}/reactions`;
module.exports.CHANNEL_BULK_DELETE = (channelID) => `/channels/${channelID}/messages/bulk-delete`;
module.exports.CHANNEL_PERMISSIONS = (channelID, overwriteID) => `/channels/${channelID}/permissions/${overwriteID}`;
module.exports.CHANNEL_INVITES = (channelID) => `/channels/${channelID}/invites`;
module.exports.CHANNEL_TYPING = (channelID) => `/channels/${channelID}/typing`;
module.exports.CHANNEL_PINS = (channelID) => `/channels/${channelID}/pins`;
module.exports.CHANNEL_PIN = (channelID, messageID) => `/channels/${channelID}/pins/${messageID}`;
module.exports.CHANNEL_RECIPIENT = (channelID, userID) => `/channels/${channelID}/recipients/${userID}`;

// GUILD ENDPOINTS
module.exports.GUILDS = "/guilds";
module.exports.GUILD = (guildID) => `/guilds/${guildID}`;
module.exports.GUILD_EMOJIS = (guildID) => `/guilds/${guildID}/emojis`;
module.exports.GUILD_EMOJI = (guildID, emojiID) => `/guilds/${guildID}/emojis/${emojiID}`;
module.exports.GUILD_CHANNELS = (guildID) => `/guilds/${guildID}/channels`;
module.exports.GUILD_MEMBER = (guildID, userID) => `/guilds/${guildID}/members/${userID}`;
module.exports.GUILD_MEMBERS = (guildID) => `/guilds/${guildID}/members`;
module.exports.GUILD_NICKNAME = (guildID, user="@me") => `/guilds/${guildID}/members/${user}/nick`;
module.exports.GUILD_ROLE = (guildID, userID, roleID) => `/guilds/${guildID}/members/${userID}/roles/${roleID}`;
module.exports.GUILD_ROLES = (guildID) => `/guilds/${guildID}/roles`;
module.exports.GUILD_BANS = (guildID) => `/guilds/${guildID}/bans`;
module.exports.GUILD_BAN = (guildID, userID) => `/guilds/${guildID}/bans/${userID}`;
module.exports.GUILD_PRUNE = (guildID) => `/guilds/${guildID}/prune`;
module.exports.GUILD_REGIONS = (guildID) => `/guilds/${guildID}/regions`;
module.exports.GUILD_INVITES = (guildID) => `/guilds/${guildID}/invites`;
module.exports.GUILD_INTEGRATIONS = (guildID) => `/guilds/${guildID}/integrations`;
module.exports.GUILD_INTEGRATION = (guildID, intID) => `/guilds/${guildID}/integrations/${intID}`;
module.exports.GUILD_INTEGRATION_SYNC = (guildID, intID) => `/guilds/${guildID}/integrations/${intID}/sync`;
module.exports.GUILD_EMBED = (guildID) => `/guilds/${guildID}/embed`;
module.exports.GUILD_VANITY = (guildID) => `/guilds/${guildID}/vanity-url`;
module.exports.GUILD_WIDGET = (guildID) => `/guilds/${guildID}/widget.png`;

// INVITE ENDPOINTS
module.exports.INVITE = (code) => `/invites/${code}`;

// USER ENDPOINTS
module.exports.USER = (user="@me") => `/users/${user}`;
module.exports.USER_GUILDS = (user="@me") => `/users/${user}/guilds`;
module.exports.USER_GUILD = (guildID, user="@me") => `/users/${user}/guilds/${guildID}`;
module.exports.USER_CHANNELS = (user="@me") => `/users/${user}/channels`;
module.exports.USER_CONNECTIONS = (user="@me") => `/users/${user}/connections`;

// VOICE ENDPOINTS
module.exports.VOICE_REGIONS = "/voice/regions";

// WEBHOOK ENDPOINTS
module.exports.CHANNEL_WEBHOOKS = (channelID) => `/channels/${channelID}/webhooks`;
module.exports.GUILD_WEBHOOKS = (guildID) => `/channels/${guildID}/webhooks`;
module.exports.WEBHOOK = (webID) => `/webhooks/${webID}`;
module.exports.TOKEN_WEBHOOK = (webID, token) => `/webhooks/${webID}/${token}`;
module.exports.SLACK_WEBHOOK = (webID, token) => `/webhooks/${webID}/${token}/slack`;
module.exports.GITHUB_WEBHOOK = (webID, token) => `/webhooks/${webID}/${token}/github`;

// GATEWAY ENDPOINTS
module.exports.GATEWAY = "/gateway";
module.exports.GATEWAY_BOT = "/gateway/bot";
