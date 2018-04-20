'use strict';

const express = require('express');
const alexa = require('alexa-app');
const constants = require('./constants');

const Player = require('./Player');

const Service = require('./Service');
const service = new Service();

const Database = require('./Database');
const DB = new Database();

const PORT = 61098;
const app = express();

const alexaApp = new alexa.app('local-music-stream');

alexaApp.express({
    expressApp: app,
    checkCert: true,
    debug: true
});

/*
{url: 'https://pschild.duckdns.org:3443/play/%2Fmedia%2Fpi%2FINTENSO%2FSpotify/Deichkind - Naschfuchs/cHNjaGlsZDpnZWhlaW0=', artist: 'Deichkind', title: 'Naschfuchs'},
{url: 'https://pschild.duckdns.org:3443/play/%2Fmedia%2Fpi%2FINTENSO%2FSpotify/Deichkind - Like mich am Arsch/cHNjaGlsZDpnZWhlaW0=', artist: 'Deichkind', title: 'Like mich am Arsch'},
{url: 'https://pschild.duckdns.org:3443/play/%2Fmedia%2Fpi%2FINTENSO%2FSpotify/Deichkind - Roll das Fass rein/cHNjaGlsZDpnZWhlaW0=', artist: 'Deichkind', title: 'Roll das Fass rein'},
{url: 'https://pschild.duckdns.org:3443/play/%2Fmedia%2Fpi%2FINTENSO%2FSpotify/Deichkind - Hauptsache nichts mit Menschen/cHNjaGlsZDpnZWhlaW0=', artist: 'Deichkind', title: 'Hauptsache nichts mit Menschen'},
*/
const URLS = [
    {url: 'https://pschild.duckdns.org:3443/play/media/Deichkind%20-%20Der%20Mond-trim/cHNjaGlsZDpnZWhlaW0=', artist: 'Deichkind', title: 'Der Mond'},
    {url: 'https://pschild.duckdns.org:3443/play/media/Deichkind%20-%20Luftbahn-trim/cHNjaGlsZDpnZWhlaW0=', artist: 'Deichkind', title: 'Luftbahn'},
    {url: 'https://pschild.duckdns.org:3443/play/media/Deichkind%20-%20Limit-trim/cHNjaGlsZDpnZWhlaW0=', artist: 'Deichkind', title: 'Limit'}
];

let player = new Player(URLS);

alexaApp.launch(function (request, response) {
    if (DB.size() === 0) {
        DB.set('state', constants.states.STARTMODE);
    }

    if (DB.get('state') === constants.states.PLAYMODE) {
        response.say(`Willkommen zurück`);
        player.play(response);
    } else {
        response.say(`Herzlich Willkommen`).shouldEndSession(false);
    }
});

alexaApp.intent('PlayMusic', function (request, response) {
    DB.set('state', constants.states.PLAYMODE);

    const songTitle = request.slots['SONG_TITLE'].value;
    console.log(songTitle);

    return service.findSongs(`deichkind`).then(songItems => {
        player.setPlaylist(songItems);

        response.say(`Ab geht die Post`);
        player.play(response);
    });
});

/*alexaApp.intent('PlayByArtist', function (request, response) {
    DB.set('state', constants.states.PLAYMODE);

    const artist = request.slots['ARTIST'].value;

    return service.findSongs(`deichkind`).then(songItems => {
        player.setPlaylist(songItems);

        response.say(`Ab geht die Post`);
        player.play(response);
    });
});*/

alexaApp.intent('LikeSong', function (request, response) {
    console.log('LikeSong');
    const current = player.getCurrent();
    player.addToFavorites(current);
    response.say(`Das Lied ${current.title} von ${current.artist} wurde zu deinen Favoriten hinzugefügt.`);
});

alexaApp.intent('AMAZON.CancelIntent', function (request, response) {
    console.log('AMAZON.CancelIntent');
    player.stop(response);
    player.reset();
});

alexaApp.intent('AMAZON.PauseIntent', function (request, response) {
    console.log('AMAZON.PauseIntent');
    player.stop(response, request.context.AudioPlayer.offsetInMilliseconds);
});

alexaApp.intent('AMAZON.StopIntent', function (request, response) {
    console.log('AMAZON.StopIntent');
    player.stop(response, request.context.AudioPlayer.offsetInMilliseconds);
});

alexaApp.intent('AMAZON.NextIntent', function (request, response) {
    console.log('AMAZON.NextIntent');
    player.playNext(response);
});

alexaApp.intent('AMAZON.PreviousIntent', function (request, response) {
    console.log('AMAZON.PreviousIntent');
    player.playPrevious(response);
});

alexaApp.audioPlayer('PlaybackFinished', function (request, response) {
    console.log('PlaybackFinished');
    player.handlePlaybackFinished();
});

alexaApp.audioPlayer('PlaybackNearlyFinished', function (request, response) {
    console.log('PlaybackNearlyFinished');
    player.enqueueNext(response);
});

alexaApp.sessionEnded(function (request, response) {
    console.log('Session ended!');
});

app.listen(PORT, () => console.log('Listening on port ' + PORT + '.'));