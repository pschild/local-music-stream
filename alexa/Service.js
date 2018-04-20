'use strict';

const path = require('path');
const axios = require('axios');
require('dotenv').config({path: path.join(__dirname, '.env')});

// TODO: make class
const Service = function () {
    this._endpoint = axios.create({
        baseURL: process.env.BASE_URL,
        auth: {
            username: process.env.LMS_USERNAME,
            password: process.env.LMS_PASSWORD
        }
    });

    this.findOneBySongTitle = (searchString) => {
        return this._endpoint.post(`search/song`, { payload: searchString })
            .then(response => {
                let resultItem = JSON.parse(response.data.result);
                let songItem = resultItem.document;
                songItem.url += `/${this._buildBasicAuthToken()}`;
                return songItem;
            });
    };

    this.findManyBySongTitle = (searchString) => {
        return this._endpoint.post(`search/songs`, { payload: searchString })
            .then(response => {
                let resultItems = JSON.parse(response.data.result);
                let songItems = resultItems.map(resultItem => resultItem.document);
                songItems.forEach(this._appendBasicAuthToken);
                return songItems;
            });
    };

    this._appendBasicAuthToken = (songItem) => {
        songItem.url += `/${this._buildBasicAuthToken()}`;
    };

    this._buildBasicAuthToken = () => {
        return Buffer.from(`${process.env.LMS_USERNAME}:${process.env.LMS_PASSWORD}`).toString('base64');
    };
};

module.exports = Service;