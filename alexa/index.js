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

let player = new Player();

alexaApp.launch(function (request, response) {
    if (DB.size() === 0) {
        DB.set('state', constants.states.STARTMODE);
    }

    if (DB.get('state') === constants.states.PLAYMODE) {
        response.say(`Willkommen zurück`);
        // player.play(response);
    } else {
        response.say(`Herzlich Willkommen`).shouldEndSession(false);
    }
});

alexaApp.intent('PlaySong', function (request, response) {
    DB.set('state', constants.states.PLAYMODE);

    const title = request.slot('SONG_TITLE');
    const artist = request.slot('ARTIST'); // optional
    console.log(`songTitle=${songTitle}, artist=${artist}`);
    if (!title) {
        return response.say(`Das hab ich nicht verstanden`);
    }

    return service.findOne({title: title, artist: artist}).then(songItem => {
        player.setPlaylist(songItem);

        if (artist) {
            response.say(`${title} von ${artist} wird abgespielt`);
        } else {
            response.say(`${title} wird abgespielt`);
        }
        player.play(response);
    });
});

alexaApp.intent('PlaySongs', function (request, response) {
    DB.set('state', constants.states.PLAYMODE);

    const artist = request.slot('ARTIST');
    console.log(`artist=${artist}`);
    if (!artist) {
        return response.say(`Das hab ich nicht verstanden`);
    }

    return service.findMany({artist: artist}).then(songItems => {
        player.setPlaylist(songItems);

        response.say(`Lieder von ${artist} werden abgespielt`);
        player.play(response);
    });
});

alexaApp.intent('LikeCurrentSong', function (request, response) {
    console.log('LikeCurrentSong');
    const current = player.getCurrent();
    if (!current) {
        return response.say(`Ich konnte kein aktuelles Lied finden.`);
    }
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