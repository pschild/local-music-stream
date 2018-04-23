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
        .best();

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
        .all();

    res.json({
        'success': true,
        'result': filterResult
    });
});

searchRoute.post(`/artist`, (req, res) => {
    console.log('accessed /search/artist');

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByArtist(req.body.payload)
        .best();

    res.json({
        'success': true,
        'result': filterResult
    });
});

searchRoute.post(`/artists`, (req, res) => {
    console.log('accessed /search/artists');

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByArtist(req.body.payload)
        .orderBy('rating')
        .all();

    res.json({
        'success': true,
        'result': JSON.stringify(filterResult)
    });
});

searchRoute.post(`/song`, (req, res) => {
    console.log('accessed /search/song');

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByTitle(req.body.payload)
        .best();

    res.json({
        'success': true,
        'result': filterResult
    });
});

searchRoute.post(`/songs`, (req, res) => {
    console.log('accessed /search/songs');

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByTitle(req.body.payload)
        .orderBy('rating')
        .all();

    res.json({
        'success': true,
        'result': filterResult
    });
});

module.exports = searchRoute;