module.exports = class Cache {

    constructor() {
        this._validDuration = 24 * 60 * 60 * 1000; // in milliseconds, so that's 24 hours

        this._time = 0;
        this._storage = {};
    }

    setItem(key, value) {
        this._time = new Date().getTime();
        this._storage[key] = value;
    }

    getItem(key) {
        return this._storage[key];
    }

    removeItem(key) {
        delete this._storage[key];
    }

    hasExpired() {
        return new Date().getTime() - this._time > this._validDuration;
    }
};