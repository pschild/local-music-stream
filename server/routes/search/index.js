const searchRoute = require('express').Router();

const FilterResult = require('../../FilterResult');
const FileController = require('../../FileController');
const fileController = new FileController();

searchRoute.post(`/artist`, (req, res) => {
    console.log('accessed /search/artist');

    if (!req.header('Authorization') || !checkAuthorizationHeader(req.header('Authorization'))) {
        res.status(401).send(`Not authorized!`);
        return;
    }

    if (!req.body.payload) {
        sendMissingPayloadError(res);
        return;
    }

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

    if (!req.header('Authorization') || !checkAuthorizationHeader(req.header('Authorization'))) {
        res.status(401).send(`Not authorized!`);
        return;
    }

    if (!req.body.payload) {
        sendMissingPayloadError(res);
        return;
    }

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByArtist(req.body.payload)
        .orderBy('rating')
        .all();

    res.json({
        'success': true,
        'result': filterResult
    });
});

searchRoute.post(`/song`, (req, res) => {
    console.log('accessed /search/song');

    if (!req.header('Authorization') || !checkAuthorizationHeader(req.header('Authorization'))) {
        res.status(401).send(`Not authorized!`);
        return;
    }

    if (!req.body.payload) {
        sendMissingPayloadError(res);
        return;
    }

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

    if (!req.header('Authorization') || !checkAuthorizationHeader(req.header('Authorization'))) {
        res.status(401).send(`Not authorized!`);
        return;
    }

    if (!req.body.payload) {
        sendMissingPayloadError(res);
        return;
    }

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

// TODO: put in class
const checkAuthorizationHeader = function(authHeader) {
    const authValue = authHeader.replace(/^Basic /, '');
    const authTokenFromServerEnvironment = Buffer.from(`${process.env.LMS_USERNAME}:${process.env.LMS_PASSWORD}`).toString('base64');
    return authValue === authTokenFromServerEnvironment;
};

// TODO: put in class
const sendMissingPayloadError = function(res) {
    res.json({
        'success': false,
        'errorMessage': 'Ich habe deinen Suchbegriff nicht verstanden'
    });
};

module.exports = searchRoute;