'use strict';

const Player = function (songItems = []) {
    // "constructor"
    this._playlist = songItems;
    this._favorites = [];
    this._currentlyPlayingIndex = 0;
    this._stoppedAtMilliseconds = 0;

    this.setPlaylist = (songItems) => {
        this._playlist = songItems;
    };

    this.play = (response) => {
        const current = this.getCurrent();
        const stream = {
            'url': current.url,
            'token': current.url,
            'expectedPreviousToken': null,
            'offsetInMilliseconds': this._stoppedAtMilliseconds || 0
        };
        response.audioPlayerPlayStream('REPLACE_ALL', stream);
    };

    this.stop = (response, offset = 0) => {
        this._stoppedAtMilliseconds = offset;
        response.audioPlayerStop();
    };

    this.reset = () => {
        this._currentlyPlayingIndex = 0;
        this._stoppedAtMilliseconds = 0;
    };

    this.playNext = (response) => {
        const next = this.getNext();

        // change state
        this._currentlyPlayingIndex = this.getNextIndex();

        const stream = {
            'url': next.url,
            'token': next.url,
            'expectedPreviousToken': null,
            'offsetInMilliseconds': 0
        };
        response.audioPlayerPlayStream('REPLACE_ALL', stream);
    };

    this.playPrevious = (response) => {
        const previous = this.getPrevious();

        // change state
        this._currentlyPlayingIndex = this.getPreviousIndex();

        const stream = {
            'url': previous.url,
            'token': previous.url,
            'expectedPreviousToken': null,
            'offsetInMilliseconds': 0
        };
        response.audioPlayerPlayStream('REPLACE_ALL', stream);
    };

    this.enqueueNext = (response) => {
        const current = this.getCurrent();
        const next = this.getNext();

        const stream = {
            'url': next.url,
            'token': next.url,
            'expectedPreviousToken': current.url,
            'offsetInMilliseconds': 0
        };
        response.audioPlayerPlayStream('ENQUEUE', stream);
    };

    this.handlePlaybackFinished = () => {
        // change state
        this._currentlyPlayingIndex = this.getNextIndex();
    };

    this.addToFavorites = (songItem) => {
        this._favorites.push(songItem);
    };

    this.getCurrent = () => {
        return this._playlist[this._currentlyPlayingIndex];
    };

    this.getNext = () => {
        return this._playlist[this.getNextIndex()];
    };

    this.getPrevious = () => {
        return this._playlist[this.getPreviousIndex()];
    };

    this.getNextIndex = () => {
        if (this._currentlyPlayingIndex <= this._playlist.length - 2) {
            return this._currentlyPlayingIndex + 1;
        } else {
            return 0; // TODO: change this depending on loop state
        }
    };

    this.getPreviousIndex = () => {
        if (this._currentlyPlayingIndex > 0) {
            return this._currentlyPlayingIndex - 1;
        } else {
            return this._playlist.length - 1; // TODO: change this depending on loop state
        }
    };
};

module.exports = Player;