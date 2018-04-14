const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const http = require('http');
const https = require('https');
const stringSimilarity = require('string-similarity');
const _ = require('lodash');
require('dotenv').config({path: path.join(__dirname, '.env')});

const app = express();
/*
app.use(basicAuth({
    authorizer: (username, password) => username === process.env.USERNAME && password === process.env.PASSWORD,
    unauthorizedResponse: (req) => req.auth ? 'Invalid credentials!' : 'No credentials provided!'
}));
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/search', function (req, res) {
    console.log('accessed /search with '+req.method+'@' + (new Date()).toTimeString());
    console.log(`body.payload: ${JSON.stringify(req.body.payload)}`);
    if (!req.body.payload) {
        res.json({
            'success': false,
            'errorMessage': 'Ich habe deinen Suchbegriff nicht verstanden.'
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

app.get('/play/:directory/:fileName/:authToken', function (req, res) {
    console.log('accessed /play with '+req.method+'@' + (new Date()).toTimeString());
    console.log(`directory param: ${req.params.directory}`);
    console.log(`fileName param: ${req.params.fileName}`);
    console.log(`authToken param: ${req.params.authToken}`);

    // Basic Authorization is done via a url param, because Alexa cannot send HTTP headers when streaming a file
    const authTokenFromClient = req.params.authToken;
    const authTokenFromServerEnvironment = Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64');
    if (!authTokenFromClient || authTokenFromServerEnvironment !== authTokenFromClient) {
        res.status(401).send(`Invalid authorization param!`);
        return;
    }

    const fileName = req.params.fileName;
    const directory = req.params.directory;
    const filePath = `${path.join(directory, fileName)}.mp3`;
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    fs.createReadStream(filePath).pipe(res);
});

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

if (process.env.NODE_ENV === `development`) {
    const httpServer = http.createServer(app);
    httpServer.listen(3000, () => console.log('HTTP app listening on port 3000!'));
} else {
    const privateKey  = fs.readFileSync('/home/pi/dehydrated/certs/pschild.duckdns.org/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/home/pi/dehydrated/certs/pschild.duckdns.org/fullchain.pem', 'utf8');
    const credentials = {key: privateKey, cert: certificate};

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(3443, () => console.log('HTTPS app listening on port 3443!'));
}
