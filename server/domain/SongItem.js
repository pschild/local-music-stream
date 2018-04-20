module.exports = class SongItem {

    constructor(fileName) {
        this._artistSongSeparator = '-';

        this.setFilename(fileName);

        const separatorIndex = fileName.indexOf(this._artistSongSeparator);
        if (separatorIndex < 0) {
            this.setArtist('');
            this.setTitle(fileName);
        } else {
            this.setArtist(fileName.substr(0, separatorIndex).trim());
            this.setTitle(fileName.substr(separatorIndex + 1).trim());
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

    toJSON() {
        return {
            artist: this._artist,
            title: this._title,
            url: this._url,
            filename: this._filename,
            directory: this._directory
        }
    }
};