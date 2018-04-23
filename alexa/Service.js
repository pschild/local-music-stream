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

    this.findOne = (payload) => {
        return this._endpoint.post(`search/one`, { payload: payload })
            .then(response => {
                let resultItem = response.data.result;
                let songItem = resultItem.document;
                songItem.url += `/${this._buildBasicAuthToken()}`;
                return songItem;
            });
    };

    this.findMany = (payload) => {
        return this._endpoint.post(`search/many`, { payload: payload })
            .then(response => {
                let resultItems = response.data.result;
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