const path = require('path');
const fs = require('fs');
const stringSimilarity = require('string-similarity');
const _ = require('lodash');

const searchRoute = require('express').Router();

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

    const songTitle = req.body.payload;

    const allFiles = walkSync(process.env.ROOT_MEDIA_FOLDER);
    const mp3Files = allFiles.filter(file => file.fileName.includes('mp3'));
    const mp3FileNamesWithoutExtension = mp3Files.map(file => file.fileName.slice(0, -4));

    const matches = stringSimilarity.findBestMatch(songTitle, mp3FileNamesWithoutExtension);
    const filteredMatches = matches.ratings.filter(match => match.rating >= 0.4);
    const sortedByRatings = _.orderBy(filteredMatches, ['rating'], ['desc']);
    const sortedResult = sortedByRatings.map(match => {
        const fileName = match.target;
        const songInformation = getSongInformation(fileName);
        const directory = mp3Files.find(mp3File => mp3File.fileName.includes(match.target)).directory;
        return {
            fileName: fileName,
            artist: songInformation.artist,
            title: songInformation.title,
            directory: directory,
            url: `https://pschild.duckdns.org:3443/play/${encodeURIComponent(directory)}/${fileName}`,
            rating: match.rating
        }
    });
    console.log(sortedResult);

    const fileName = matches.bestMatch.target;
    const songInformation = getSongInformation(fileName);
    const directory = mp3Files.find(mp3File => mp3File.fileName.includes(matches.bestMatch.target)).directory;
    const bestMatch = {
        fileName: fileName,
        artist: songInformation.artist,
        title: songInformation.title,
        directory: directory,
        url: `https://pschild.duckdns.org:3443/play/${encodeURIComponent(directory)}/${fileName}`,
        rating: matches.bestMatch.rating
    };
    console.log(bestMatch);

    res.json({
        'success': true,
        'bestMatch': bestMatch,
        'allMatches': sortedResult
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
const walkSync = function(dir, filelist) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach((file) => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        } else {
            filelist.push({
                fileName: file,
                directory: dir
            });
        }
    });
    return filelist;
};

// TODO: put in class
const getSongInformation = function(fileName) {
    const SEPARATOR = '-';
    const separatorIndex = fileName.indexOf(SEPARATOR);
    if (separatorIndex < 0) {
        return {
            artist: null,
            title: fileName
        }
    }

    return {
        artist: fileName.substr(0, separatorIndex).trim(),
        title: fileName.substr(separatorIndex + 1).trim()
    };
};

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