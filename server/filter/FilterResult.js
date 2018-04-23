const _orderBy = require('lodash/orderBy');
const stringSimilarity = require('./stringSimilarity');

module.exports = class FilterResult {

    constructor(songItems = []) {
        this._songItems = songItems;
        this._matches = null;
        this._ratingThreshold = 0.4;
    }

    filterByArtist(searchStr) {
        if (searchStr) {
            this._matches = stringSimilarity.findBestMatchByProp(searchStr, this._songItems, (songItem) => songItem.getArtist());
        }
        return this;
    }

    filterByTitle(searchStr) {
        if (searchStr) {
            this._matches = stringSimilarity.findBestMatchByProp(searchStr, this._songItems, (songItem) => songItem.getTitle());
        }
        return this;
    }

    filterByFilename(searchStr) {
        if (searchStr) {
            this._matches = stringSimilarity.findBestMatchByProp(searchStr, this._songItems, (songItem) => songItem.getFilename());
        }
        return this;
    }

    orderBy(attribute, order = 'desc') {
        // attribute can for example be 'rating' or (x) => x.document.getArtist()
        this._matches.ratings = _orderBy(this._matches.ratings, [attribute], [order]);
        return this;
    }

    shuffle() {
        this._matches.ratings.sort((a, b) => Math.random() - 0.5);
        return this;
    }

    // TODO: test method!
    random() {
        if (!this._matches) {
            throw `FilterResult does not contain any matches.`;
        }
        this._matches.ratings.filter(match => match.rating >= this._ratingThreshold);
        this.shuffle();
        return this._matches[0];
    }

    best() {
        if (!this._matches) {
            throw `FilterResult does not contain any matches.`;
        }
        return this._matches.bestMatch;
    }

    all() {
        if (!this._matches) {
            throw `FilterResult does not contain any matches.`;
        }
        return this._matches.ratings
            .filter(match => match.rating >= this._ratingThreshold);
    }
};