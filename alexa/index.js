const path = require('path');
const Alexa = require('alexa-sdk');
const https = require('https');
require('dotenv').config({path: path.join(__dirname, '.env')});

const handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', 'Hi!');
    },
    
    'SwitchIntent': function() {
        let switchNameSlot = this.event.request.intent.slots.SWITCH_NAME;
        let switchActionSlot = this.event.request.intent.slots.SWITCH_ACTION;
        // console.log(switchNameSlot.value, switchActionSlot.value);

        post({ switchNameSlot: switchNameSlot, switchActionSlot: switchActionSlot }, (response) => {
            // console.log('received by RPi:' + response);
            if (response.success) {
                this.emit(':ask', 'Okay. Soll ich noch weitere Steckdosen schalten?');
            } else {
                this.emit(':ask', `${response.result} Was soll ich schalten?`);
            }
        });
    },

    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'Alles klar! Bis dann!');
    },

    'AMAZON.NoIntent': function() {
        this.emit(':tell', 'Na gut. Tschau mit v!');
    }
};

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = 'TODO';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function get(switchName, switchAction, callback) {
    let req = https.get(`https://pschild.duckdns.org:3443/alexa`, res => {
        res.setEncoding('utf8');
        let returnData = '';

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            console.log(returnData);
            let result = JSON.parse(returnData);
            console.log(result);
            callback(result);
        });

    }).on('error', (e) => {
        console.error(e);
    });
    req.end();
}

function post(payload, callback) {
    let body = JSON.stringify({'payload': payload});
    let authToken = Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64');

    const options = {
        hostname: `pschild.duckdns.org`,
        port: 3443,
        path: `/alexa`,
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
            let result = JSON.parse(returnData);
            callback(result);
        });
    }).on('error', (e) => {
        console.error(e);
    });
    req.write(body);
    req.end();
}
