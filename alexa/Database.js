module.exports = class Database {

    constructor() {
        this._storage = {};
    }

    set(key, value) {
        this._storage[key] = value;
    }

    get(key) {
        return this._storage.hasOwnProperty(key) ? this._storage[key] : undefined;
    }

    size() {
        return Object.keys(this._storage).length;
    }

    clear() {
        this._storage = {};
    }
};