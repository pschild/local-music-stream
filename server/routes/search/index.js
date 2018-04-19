const searchRoute = require('express').Router();

const FilterResult = require('../../FilterResult');
const FileController = require('../../FileController');
const fileController = new FileController();

// TODO: remove
searchRoute.post(`/`, (req, res) => {
    if (!checkAuthorization(req.header('Authorization'))) {
        res.status(401).send(`Invalid authorization param!`);
        return;
    }

    console.log('accessed /search with '+req.method+'@' + (new Date()).toTimeString());
    console.log(`body.payload: ${JSON.stringify(req.body.payload)}`);
    if (!req.body.payload) {
        res.json({
            'success': false,
            'errorMessage': 'Ich habe deinen Suchbegriff nicht verstanden'
        });
    }

    const mediaFiles = fileController.getMediaFiles(process.env.ROOT_MEDIA_FOLDER);
    let filterResult = new FilterResult(mediaFiles)
        .filterByFilename(req.body.payload)
        .orderBy('rating')
        .all();

    res.json({
        'success': true,
        'result': filterResult
    });
});

searchRoute.post(`/artist`, (req, res) => {
    if (!checkAuthorization(req.header('Authorization'))) {
        res.status(401).send(`Invalid authorization param!`);
        return;
    }

    console.log('accessed /search/artist');
    const payload = req.body.payload;
    res.json({ 'result': 'OK' });
});

searchRoute.post(`/artists`, (req, res) => {
    if (!checkAuthorization(req.header('Authorization'))) {
        res.status(401).send(`Invalid authorization param!`);
        return;
    }

    console.log('accessed /search/artists');
    const payload = req.body.payload;
    res.json({ 'result': 'OK' });
});

searchRoute.post(`/song`, (req, res) => {
    if (!checkAuthorization(req.header('Authorization'))) {
        res.status(401).send(`Invalid authorization param!`);
        return;
    }

    console.log('accessed /search/song');
    const payload = req.body.payload;
    res.json({ 'result': 'OK' });
});

searchRoute.post(`/songs`, (req, res) => {
    if (!checkAuthorization(req.header('Authorization'))) {
        res.status(401).send(`Invalid authorization param!`);
        return;
    }

    console.log('accessed /search/songs');
    const payload = req.body.payload;
    res.json({ 'result': 'OK' });
});

// TODO: put in class
const checkAuthorization = function(authHeader) {
    if (!authHeader) {
        return false;
    }

    const authValue = authHeader.replace(/^Basic /, '');
    const authTokenFromServerEnvironment = Buffer.from(`${process.env.LMS_USERNAME}:${process.env.LMS_PASSWORD}`).toString('base64');
    console.log(authTokenFromServerEnvironment, authValue);
    return authValue === authTokenFromServerEnvironment;
};

module.exports = searchRoute;