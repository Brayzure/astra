const RateLimiter = require("./RateLimiter");
const Endpoints = require("./Endpoints");
const https = require("https");

class RequestHandler {
    constructor(auth) {
        this.rateLimiter = new RateLimiter();
        this.auth = auth;
    }

    request(method, route, body={}, headers={}, qs={}, version=undefined) {
        return new Promise((resolve, reject) => {
            if(!version) version = Endpoints.SUPPORTED_REST_VERSIONS[0];
            if(!headers["User-Agent"]) headers["User-Agent"] = "astra-lib-dev Brayzure#9877";
            const fullPath = `${Endpoints.BASE_URL}/v${version}${route}`;
            if(this.auth) headers["Authorization"] = this.auth;
            const options = {
                method,
                headers,
                host: Endpoints.HOST,
                path: fullPath
            };
            function makeRequest(route, options, body) {
                return new Promise((resolve, reject) => {
                    if(Object.keys(body).length) options.headers["Content-Type"] = "application/json";
                    const req = https.request(options, (res) => {
                        const ratelimitInfo = {};
                        if(res.headers["x-ratelimit-limit"]) ratelimitInfo.limit = +res.headers["x-ratelimit-limit"];
                        if(res.headers["x-ratelimit-remaining"]) ratelimitInfo.remaining = +res.headers["x-ratelimit-remaining"];
                        if(res.headers["x-ratelimit-reset"]) ratelimitInfo.reset = +res.headers["x-ratelimit-reset"];
                        this.rateLimiter.updateRoute(route, ratelimitInfo);
                        const chunks = [];
                        res.on("data", (chunk) => {
                            chunks.push(chunk);
                        });
                        res.on("end", () => {
                            //console.log(chunks);
                            //console.log(chunks.toString());
                            resolve(JSON.parse(chunks.toString()));
                        });
                    });
                    if(Object.keys(body).length) req.write(JSON.stringify(body));
                    req.end();
                });
            }
            const boundFunction = makeRequest.bind(this, route, options, body);
            const valid = this.rateLimiter.consume(route);
            if(valid) {
                boundFunction().then(result => resolve(result));
            }
            else {
                this.rateLimiter.defer(route, boundFunction, (r) => resolve(r));
            }
        })
    }
}

module.exports = RequestHandler;
