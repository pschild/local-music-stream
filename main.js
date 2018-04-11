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
    const songTitle = req.body.payload;

    const mp3Files = fs.readdirSync('./media')
        .filter(fileName => fileName.includes('mp3'))
        .map(fileName => fileName.slice(0, -4));
    const matches = stringSimilarity.findBestMatch(songTitle, mp3Files);
    const filteredMatches = matches.ratings.filter(match => match.rating >= 0.4);
    const sortedByRatings = _.orderBy(filteredMatches, ['rating'], ['desc']);
    const mappedToUrl = sortedByRatings.map(match => `https://pschild.duckdns.org:3443/play/${match.target}`);
    console.log(sortedByRatings);

    res.json({
        'success': true,
        'url': `https://pschild.duckdns.org:3443/play/${matches.bestMatch.target}`,
        'multiple': mappedToUrl
    });
});

app.get('/play/:fileName/:authToken', function (req, res) {
    console.log('accessed /play with '+req.method+'@' + (new Date()).toTimeString());
    console.log(`fileName param: ${req.params.fileName}`);
    console.log(`authToken param: ${req.params.authToken}`);

    // Basic Authorization is done via a url param, because Alexa cannot send HTTP headers when streaming a file
    const authTokenFromClient = req.params.authToken;
    const authTokenFromServerEnvironment = Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64');
    if (!authTokenFromClient || authTokenFromServerEnvironment !== authTokenFromClient) {
        res.status(401).send(`Invalid authorization param!`);
        return;
    }

    const fileName = req.params.fileName; // TODO: take param into account
    const filePath = `./media/${fileName}.mp3`;
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    fs.createReadStream(filePath).pipe(res);
});

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
