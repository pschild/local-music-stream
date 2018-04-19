const path = require('path');
const fs = require('fs');
const SongItem = require('./SongItem');

module.exports = class FileController {

    constructor() {
        this._possibleFileExtensions = ['mp3'];
    }

    getMediaFiles(dir, includeSubDirs = true) {
        return this.getFileList(dir, includeSubDirs)
            .filter(file => this._possibleFileExtensions.some(ext => file.fileName.indexOf(ext) >= 0))
            .map(mediaFile => {
                let songItem = new SongItem(mediaFile.fileNameWithoutExtension);
                songItem.setDirectory(mediaFile.directory);
                songItem.setUrl(`${process.env.BASE_URL}/play/${encodeURIComponent(mediaFile.directory)}/${mediaFile.fileNameWithoutExtension}`);
                return songItem;
            });
    }

    getFileList(dir, includeSubDirs = true) {
        return this.walkDir(dir, includeSubDirs);
    }

    walkDir(dir, includeSubDirs, fileList = []) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const current = fs.statSync(path.join(dir, file));
            if (includeSubDirs && current.isDirectory()) {
                fileList = this.walkDir(path.join(dir, file), includeSubDirs, fileList);
            } else if (current.isFile()) {
                fileList.push({
                    fileName: file,
                    fileNameWithoutExtension: this._trimFileExtension(file),
                    directory: dir
                });
            }
        });
        return fileList;
    }

    _trimFileExtension(filename) {
        return filename.replace(/\.[^/.]+$/, '');
    }
};