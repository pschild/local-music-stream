'use strict';

const Database = function () {
    this._storage = {};

    this.set = (key, value) => {
        this._storage[key] = value;
    };

    this.get = (key) => {
        return this._storage.hasOwnProperty(key) ? this._storage[key] : undefined;
    };

    this.size = () => {
        return Object.keys(this._storage).length;
    };

    this.clear = () => {
        this._storage = {};
    };
};

module.exports = Database;