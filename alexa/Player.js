module.exports = class Player {

    constructor(songItems = []) {
        this._favorites = [];
        this.setPlaylist(songItems);
        this.reset();
    }

    setPlaylist(songItems) {
        if (!Array.isArray(songItems)) {
            songItems = [songItems];
        }
        this._playlist = songItems;
    }

    play(response) {
        const current = this.getCurrent();
        const stream = {
            'url': current.url,
            'token': current.url,
            'expectedPreviousToken': null,
            'offsetInMilliseconds': this._stoppedAtMilliseconds || 0
        };
        response.audioPlayerPlayStream('REPLACE_ALL', stream);
    }

    stop(response, offset = 0) {
        this._stoppedAtMilliseconds = offset;
        response.audioPlayerStop();
    }

    reset() {
        this._currentlyPlayingIndex = 0;
        this._stoppedAtMilliseconds = 0;
    }

    playNext(response) {
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
    }

    playPrevious(response) {
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
    }

    enqueueNext(response) {
        const current = this.getCurrent();
        const next = this.getNext();

        const stream = {
            'url': next.url,
            'token': next.url,
            'expectedPreviousToken': current.url,
            'offsetInMilliseconds': 0
        };
        response.audioPlayerPlayStream('ENQUEUE', stream);
    }

    handlePlaybackFinished() {
        // change state
        this._currentlyPlayingIndex = this.getNextIndex();
    }

    addToFavorites(songItem) {
        this._favorites.push(songItem);
    }

    getFavorites() {
        return this._favorites;
    }

    getCurrent() {
        return this._playlist[this._currentlyPlayingIndex];
    }

    getNext() {
        return this._playlist[this.getNextIndex()];
    }

    getPrevious() {
        return this._playlist[this.getPreviousIndex()];
    }

    getNextIndex() {
        if (this._currentlyPlayingIndex <= this._playlist.length - 2) {
            return this._currentlyPlayingIndex + 1;
        } else {
            return 0; // TODO: change this depending on loop state
        }
    }

    getPreviousIndex() {
        if (this._currentlyPlayingIndex > 0) {
            return this._currentlyPlayingIndex - 1;
        } else {
            return this._playlist.length - 1; // TODO: change this depending on loop state
        }
    }
};