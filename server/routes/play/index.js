const path = require('path');
const fs = require('fs');
const playRoute = require('express').Router();

const authIsValid = require('../../util/auth');

const checkAuth = (req, res, next) => {
    const authToken = req.params.authToken;
    if (!authIsValid(authToken)) {
        return res.status(401).send(`Not authorized`);
    }
    return next();
};

playRoute.get(`/:directory/:fileName/:authToken`, checkAuth, (req, res) => {
    console.log('accessed /play with '+req.method+'@' + (new Date()).toTimeString());
    console.log(`directory param: ${req.params.directory}`);
    console.log(`fileName param: ${req.params.fileName}`);
    console.log(`authToken param: ${req.params.authToken}`);

    // Basic Authorization is done via a url param, because Alexa cannot send HTTP headers when streaming a file
    const authTokenFromClient = req.params.authToken;
    // TODO: put in class, see search routes (code duplication)
    const authTokenFromServerEnvironment = Buffer.from(`${process.env.LMS_USERNAME}:${process.env.LMS_PASSWORD}`).toString('base64');
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

module.exports = playRoute;