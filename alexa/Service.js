const path = require('path');
const axios = require('axios');
require('dotenv').config({path: path.join(__dirname, '.env')});

module.exports = class Service {

    constructor() {
        this._endpoint = axios.create({
            baseURL: process.env.BASE_URL,
            auth: {
                username: process.env.LMS_USERNAME,
                password: process.env.LMS_PASSWORD
            }
        });
    }

    findOne(payload) {
        return this._endpoint.post(`search/one`, { payload: payload })
            .then(response => {
                let songItem = response.data.result;
                if (!songItem) {
                    return;
                }

                songItem.url += `/${this._buildBasicAuthToken()}`;
                return songItem;
            });
    }

    findMany(payload) {
        return this._endpoint.post(`search/many`, { payload: payload })
            .then(response => {
                let songItems = response.data.result;
                if (!songItems || !songItems.length) {
                    return;
                }

                songItems.forEach(songItem => {
                    songItem.url += `/${this._buildBasicAuthToken()}`;
                });
                return songItems;
            });
    }

    _buildBasicAuthToken() {
        return Buffer.from(`${process.env.LMS_USERNAME}:${process.env.LMS_PASSWORD}`).toString('base64');
    }
};