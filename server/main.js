const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config({path: path.join(__dirname, '.env')});

const app = express();
const routes = require('./routes/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(`/`, routes);

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
