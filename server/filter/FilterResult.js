const _orderBy = require('lodash/orderBy');
const _maxBy = require('lodash/maxBy');
const stringSimilarity = require('./stringSimilarity');

module.exports = class FilterResult {

    constructor(songItems = []) {
        this._matches = songItems;
        this._ratingThreshold = 0.4;
    }

    filterByArtist(searchStr) {
        if (searchStr) {
            this._matches = stringSimilarity.setRatingsByProp(searchStr, this._matches, (songItem) => songItem.getArtist());
            this.filterByRatingThreshold();
        }
        return this;
    }

    filterByTitle(searchStr) {
        if (searchStr) {
            this._matches = stringSimilarity.setRatingsByProp(searchStr, this._matches, (songItem) => songItem.getTitle());
            this.filterByRatingThreshold();
        }
        return this;
    }

    filterByFilename(searchStr) {
        if (searchStr) {
            this._matches = stringSimilarity.setRatingsByProp(searchStr, this._matches, (songItem) => songItem.getFilename());
            this.filterByRatingThreshold();
        }
        return this;
    }

    filterByRatingThreshold() {
        if (!this._matches) {
            throw `FilterResult does not contain any matches.`;
        }
        this._matches = this._matches.filter(songItem => songItem.getRating() >= this._ratingThreshold);
        return this;
    }

    orderBy(attributeFn, order = 'desc') {
        this._matches = _orderBy(this._matches, [attributeFn], [order]);
        return this;
    }

    shuffle() {
        this._matches.sort((a, b) => Math.random() - 0.5);
        return this;
    }

    getRandom() {
        if (!this._matches) {
            throw `FilterResult does not contain any matches.`;
        }
        this.shuffle();
        return this._matches[0];
    }

    getBest() {
        if (!this._matches) {
            throw `FilterResult does not contain any matches.`;
        }
        return _maxBy(this._matches, (songItem) => songItem.getRating());
    }

    getAll() {
        if (!this._matches) {
            throw `FilterResult does not contain any matches.`;
        }
        return this._matches;
    }
};