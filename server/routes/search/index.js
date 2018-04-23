const searchRoute = require('express').Router();

const FilterResult = require('../../filter/FilterResult');
const FileController = require('../../file/FileController');
const fileController = new FileController();

const authIsValid = require('../../util/auth');

searchRoute.use((req, res, next) => {
    const authToken = req.header('Authorization');
    if (!authIsValid(authToken)) {
        return res.status(401).send(`Not authorized`);
    }
    return next();
});

searchRoute.use((req, res, next) => {
    if (!req.body.payload) {
        return res.json({
            'success': false,
            'errorMessage': 'Ich habe deinen Suchbegriff nicht verstanden'
        });
    }
    return next();
});

searchRoute.post(`/one`, (req, res) => {
    console.log('accessed /search/one');

    const {title, artist} = req.body.payload;

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByTitle(title)
        .filterByArtist(artist)
        .getBest();

    res.json({
        'success': true,
        'result': filterResult
    });
});

searchRoute.post(`/many`, (req, res) => {
    console.log('accessed /search/many');

    const artist = req.body.payload.artist;

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByArtist(artist)
        .orderBy('rating')
        .getAll();

    res.json({
        'success': true,
        'result': filterResult
    });
});

searchRoute.post(`/one/random`, (req, res) => {
    console.log('accessed /search/one/random');

    const artist = req.body.payload.artist;
    console.log(artist);

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByArtist(artist)
        .getRandom();

    res.json({
        'success': true,
        'result': filterResult
    });
});

searchRoute.post(`/many/random`, (req, res) => {
    console.log('accessed /search/many/random');

    const artist = req.body.payload.artist;

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByArtist(artist)
        .shuffle()
        .getAll();

    res.json({
        'success': true,
        'result': filterResult
    });
});

module.exports = searchRoute;