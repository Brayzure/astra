class Sequence {
    constructor(max, interval) {
        this.limit = max || 0;
        this.remaining = max || 0;
        this.reset = Infinity;
        this.deferred = [];
        this.interval = interval;
    }

    consume() {
        if(this.remaining > 0) {
            this.remaining--;
            if(!this.resetTimeout && this.interval) {
                this.update({ reset: Date.now() / 1000 + this.interval });
            }
            return this;
        }
        return false;
    }

    update(info={}) {
        this.limit = info.limit || this.limit;
        this.remaining = info.remaining || this.remaining;
        this.reset = info.reset * 1000 || this.reset;
        if(info.reset) {
            if(this.resetTimeout) clearTimeout(this.resetTimeout);
            this.resetTimeout = setTimeout(this.resetRemaining.bind(this), this.reset - Date.now());
        }
        else if(this.remaining < this.limit && this.interval) {
            if(this.resetTimeout) clearTimeout(this.resetTimeout);
            this.resetTimeout = setTimeout(this.resetRemaining.bind(this), this.interval * 1000);
        }
    }

    defer(func) {
        if(this.remaining > 0 && this.deferred.length === 0) return func(...args);
        this.deferred.push(func);
    }

    async resetRemaining() {
        this.resetTimeout = undefined;
        this.remaining = this.limit;
        while(this.deferred.length && this.remaining) {
            this.remaining--;
            this.deferredFunc = this.deferred.shift();
            try {
                const result = await this.deferredFunc.func();
                this.deferredFunc.cb(result);
            }
            catch(err) {
                this.deferredFunc.fcb(err);
            }
        }
        this.update();
    }
}

class RateLimiter {
    constructor() {
        this.routes = {};
    }

    consume(route) {
        const majorRoute = this.getMajorRoute(route);
        const routeInfo = this.routes[majorRoute];
        if(!routeInfo) {
            this.routes[majorRoute] = new Sequence();
            return this.routes[majorRoute];
        }
        return this.routes[majorRoute].consume();
    }

    defer(route, func, cb, fcb) {
        this.routes[this.getMajorRoute(route)].defer({ func, cb, fcb });
    }

    updateRoute(route, info) {
        const majorRoute = this.getMajorRoute(route);
        if(!this.routes[majorRoute]) {
            this.routes[majorRoute] = new Sequence();
        }
        this.routes[majorRoute].update(info);
    }

    getMajorRoute(route) {
        const majorParameters = [ "channels", "guilds", "webhooks" ];
        const replacementParameter = "x";
        const regex = new RegExp(/[^a-z]/gi);
        const args = route.split("/");
        for(let i = 0; i < args.length; i++) {
            if(regex.test(args[i]) && !(args[i-1] && majorParameters.includes(args[i-1]))) {
                args[i] = replacementParameter;
            }
        }

        return args.join("/");
    }
}

module.exports = RateLimiter;
module.exports.Sequence = Sequence;
