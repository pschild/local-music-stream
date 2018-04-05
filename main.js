const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config({path: path.join(__dirname, '.env')});

const privateKey  = fs.readFileSync('/home/pi/dev/dehydrated/certs/pschild.duckdns.org/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/home/pi/dev/dehydrated/certs/pschild.duckdns.org/fullchain.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const app = express();
app.use(basicAuth({
    authorizer: (username, password) => username === process.env.USERNAME && password === process.env.PASSWORD,
    unauthorizedResponse: (req) => req.auth ? 'Invalid credentials!' : 'No credentials provided!'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/mp3', function (req, res) {
    console.log('accessed with '+req.method+'@' + (new Date()).toTimeString());

    var filePath = 'media/Havana.mp3';
    var stat = fs.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    fs.createReadStream(filePath).pipe(res);
});

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

httpServer.listen(3000, () => console.log('HTTP app listening on port 3000!'));
httpsServer.listen(3443, () => console.log('HTTPS app listening on port 3443!'));
