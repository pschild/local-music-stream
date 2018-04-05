const path = require('path');
const Alexa = require('alexa-sdk');
const https = require('https');
require('dotenv').config({path: path.join(__dirname, '.env')});

const welcomeMessage = `Was möchtest du hören?`;

const handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', welcomeMessage, welcomeMessage);
    },

    'PlaySongIntent': function() {
        const songTitle = this.event.request.intent.slots.SONG_TITLE.value;
        console.log(songTitle);

        search(songTitle, (response) => {
            if (response.success) {
                console.log(response.url);
                this.response.speak('Ein bestimmtes Lied').audioPlayerPlay('REPLACE_ALL', response.url, response.url, null, 0);
                this.emit(':responseReady');
            } else {
                this.emit(':tell', 'Das habe ich nicht verstanden.');
            }
        });
    },

    'PlaySongsOfArtistIntent': function() {
        const artistName = this.event.request.intent.slots.ARTIST.value;
        console.log(artistName);

        search(artistName, (response) => {
            if (response.success) {
                console.log(response.multiple);
                const firstSong = response.multiple[0];
                this.response.speak(`${response.multiple.length} Lieder eines Sängers`).audioPlayerPlay('REPLACE_ALL', response.url, response.url, null, 0);

                for (let i = 1; i < response.multiple.length; i++) {
                    this.audioPlayerPlay('ENQUEUE', response.multiple[i], response.multiple[i], null, 0);
                }
                this.emit(':responseReady');
            } else {
                this.emit(':tell', 'Das habe ich nicht verstanden.');
            }
        });
    },

    'PlaybackFinished': function() {
        console.log('The stream comes to an end');
    },

    'AMAZON.ResumeIntent': function () {
        this.emit(':tell', 'ResumeIntent', 'ResumeIntent');
    },

    'AMAZON.PauseIntent': function () {
        this.emit('AMAZON.StopIntent');
    },

    'AMAZON.CancelIntent': function () {
        this.emit('AMAZON.StopIntent');
    },

    'AMAZON.StopIntent': function () {
        this.response.speak('halt stop').audioPlayerStop();
        this.emit(':responseReady');
    },

    'AMAZON.LoopOffIntent': function () {
        this.emit(':tell', 'LoopOffIntent', 'LoopOffIntent');
    },

    'AMAZON.LoopOnIntent': function () {
        this.emit(':tell', 'LoopOnIntent', 'LoopOnIntent');
    },

    'AMAZON.NextIntent': function () {
        this.emit(':tell', 'NextIntent', 'NextIntent');
    },

    'AMAZON.PreviousIntent': function () {
        this.emit(':tell', 'PreviousIntent', 'PreviousIntent');
    },

    'AMAZON.RepeatIntent': function () {
        this.emit(':tell', 'RepeatIntent', 'RepeatIntent');
    },

    'AMAZON.ShuffleOffIntent': function () {
        this.emit(':tell', 'ShuffleOffIntent', 'ShuffleOffIntent');
    },

    'AMAZON.ShuffleOnIntent': function () {
        this.emit(':tell', 'ShuffleOnIntent', 'ShuffleOnIntent');
    },

    'AMAZON.StartOverIntent': function () {
        this.emit(':tell', 'StartOverIntent', 'StartOverIntent');
    }
};

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = 'amzn1.ask.skill.1de6736f-14a6-4d7d-8949-d67e55da2534';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function search(payload, callback) {
    const body = JSON.stringify({'payload': payload});
    const authToken = Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64');

    const options = {
        hostname: `pschild.duckdns.org`,
        port: 3443,
        path: `/search`,
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
            "Authorization": `Basic ${authToken}`
        }
    };

    const req = https.request(options, res => {
        res.setEncoding('utf8');
        let returnData = '';

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            const result = JSON.parse(returnData);
            callback(result);
        });
    }).on('error', (e) => {
        console.error(e);
    });
    req.write(body);
    req.end();
}