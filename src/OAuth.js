const RequestHandler = require("./rest/RequestHandler");
const Endpoints = require("./rest/Endpoints");

class OAuth {
    constructor(options) {
        this.requestHandler = new RequestHandler();
        this.clientID = options.clientID;
        this.clientSecret = options.clientSecret;
        this.redirect = options.redirectURI;
        // Let's host the server ourselves
        if(options.port) {
            this.port = options.port;
            this.server = require("http").createServer(this.onRequest.bind(this));
            this.server.listen(this.port);
            console.log(this.server.listening);
        }
    }

    generateURL(scopes) {
        const scopeStr = scopes.join(" ");
        const params = {
            response_type: "code",
            client_id: this.clientID,
            scope: scopeStr,
            redirect_uri: this.redirect
        };
        const paramStr = Object.entries(params).map(([ key, val ]) => key + "=" + encodeURIComponent(val)).join("&");
        return `https://${Endpoints.HOST}${Endpoints.BASE_URL}${Endpoints.AUTHORIZE}?${paramStr}`;
    }

    onRequest(req, res) {
        if(req.url.startsWith("/?code") || req.url.startsWith("/?state")) {
            const url = req.url.slice(2);
            const params = {};
            url.split("&").map(e => {
                const [ key, val ] = e.split("=");
                params[key] = decodeURIComponent(val);
            });
            console.log(params);
        }
        res.end();
    }

    exchangeCode(code, scopes) {
        const data = {
            client_id: this.clientID,
            client_secret: this.clientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: this.redirect,
            scope: scopes
        };
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        };
        return this.requestHandler.request("POST", Endpoints.TOKEN, data, headers);
    }
}

module.exports = OAuth;
