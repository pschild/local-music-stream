module.exports = class SongItem {

    constructor(fileName) {
        this._artistSongSeparator = ' - ';

        this.setFilename(fileName);
        this.setRating(0);

        const separatorIndex = fileName.lastIndexOf(this._artistSongSeparator);
        if (separatorIndex < 0) {
            this.setArtist('');
            this.setTitle(fileName);
        } else {
            this.setArtist(fileName.substr(0, separatorIndex).trim());
            this.setTitle(fileName.substr(separatorIndex + this._artistSongSeparator.length).trim());
        }
    }

    setArtist(artist) {
        this._artist = artist;
    }

    setTitle(title) {
        this._title = title;
    }

    setUrl(url) {
        this._url = url;
    }

    setFilename(filename) {
        this._filename = filename;
    }

    setDirectory(dir) {
        this._directory = dir;
    }

    setRating(rating) {
        this._rating = rating;
    }

    getArtist() {
        return this._artist;
    }

    getTitle() {
        return this._title;
    }

    getUrl() {
        return this._url;
    }

    getFilename() {
        return this._filename;
    }

    getDirectory() {
        return this._directory;
    }

    getRating() {
        return this._rating;
    }

    toJSON() {
        return {
            artist: this._artist,
            title: this._title,
            url: this._url,
            filename: this._filename,
            directory: this._directory,
            rating: this._rating
        }
    }
};