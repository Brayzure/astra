const https = require("https");

const RateLimiter = require("./RateLimiter");
const Endpoints = require("./Endpoints");

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
                    if(Object.keys(body).length || options.method === "POST") options.headers["Content-Type"] = "application/json";
                    const buffers = [];
                    if(body.file) {
                        const boundary = "boundary-astra";
                        if(!Array.isArray(body.file)) {
                            body.file = [ body.file ];
                        }

                        let i = 0;
                        for(const file of body.file) {
                            if(file instanceof Buffer) {
                                file = {
                                    file: body.file
                                }
                            }
                            file.id = "uploadedFile";
                            options.headers["Content-Type"] = "multipart/form-data; boundary=" + boundary;
                            let str = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="${file.id}${i}"`;
                            if(file.name) str += `; filename="${file.name}"`;
                            str += "\r\nContent-Type: application/octet-stream\r\n\r\n";
                            buffers.push(Buffer.from(str));
                            buffers.push(file.file);
                            i++;
                        }
                        
                        delete body.file;
                        if(Object.keys(body).length) {
                            let str = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="payload_json"`;
                            str += "\r\nContent-Type: application/json\r\n\r\n";
                            buffers.push(Buffer.from(str));
                            buffers.push(Buffer.from(JSON.stringify(body)));
                        }
                        buffers.push(Buffer.from(`\r\n--${boundary}--`));
                    }
                    if(Object.keys(body).length && (options.method === "GET" || (options.method === "PUT" && options.path.match(/\/guilds\/\d+\/bans\/\d+/i)))) {
                        const qs = Object.entries(body).map(e => `${e[0]}=${encodeURIComponent(e[1])}`).join("&");
                        options.path += "?" + qs;
                        body = {};
                    }
                    const req = https.request(options, (res) => {
                        const ratelimitInfo = {};
                        if(res.headers["x-ratelimit-limit"]) ratelimitInfo.limit = +res.headers["x-ratelimit-limit"];
                        if(res.headers["x-ratelimit-remaining"]) ratelimitInfo.remaining = +res.headers["x-ratelimit-remaining"];
                        if(res.headers["x-ratelimit-reset"]) ratelimitInfo.reset = +res.headers["x-ratelimit-reset"];
                        this.rateLimiter.updateRoute(route, ratelimitInfo);
                        const chunks = [];

                        res.on("error", reject);
                        res.on("data", (chunk) => {
                            chunks.push(chunk);
                        });
                        res.on("end", () => {
                            if(!chunks.length) return resolve();
                            const response = JSON.parse(Buffer.concat(chunks).toString());
                            if(res.statusCode >= 300) {
                                console.log(res.statusCode);
                                const err = response.message ? new Error(response.message) : response;
                                if(response.code) err.code = response.code;
                                return reject(err);
                            }
                            return resolve(response);
                        });
                    });
                    if(buffers.length) {
                        for(const buf of buffers) {
                            req.write(buf);
                        }
                    }
                    else {
                        req.write(JSON.stringify(body));
                    }
                    req.end();
                });
            }
            const boundFunction = makeRequest.bind(this, route, options, body);
            const valid = this.rateLimiter.consume(route);
            if(valid) {
                boundFunction().then(resolve, reject);
            }
            else {
                this.rateLimiter.defer(route, boundFunction, resolve, reject);
            }
        })
    }
}

module.exports = RequestHandler;
