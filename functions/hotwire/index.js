const request = require('request-promise');
const _ = require('lodash');
const config = require('../config');

const DEFAULT_FILTERS = {
    rooms: 1,
    adults: 1,
    children: 0,
    duration: '5~*', // 5 or more days
    distance: '*~20', // within 20miles from the destination location
    starrating: 3, // 3 star hotels
    limit: 3,
    format: 'json'
};

/**
 * @param {string} params.dest hotel dest location e.g 37.792,-122.397 or San Francisco
 * @param {string} params.startdate MM/DD/YYYY format optional
 * @param {string} params.enddate MM/DD/YYYY format optional
 * @param {number} params.limit by default 3
 */
function getHotelDeals(uid, params) {
    const payload = {
        uri: `${config.hotwire.apiBase}/v1/deal/hotel`,
        qs: _.extend({}, DEFAULT_FILTERS, params, {
            apikey: config.hotwire.apiKey
        }),
        json: true
    };

    return request(payload)
    .then(response => {
        if (!response) {
            throw new Error('No Response');
        }

        if (response.Errors && response.Errors.length) {
            console.error(response.Errors);
            throw new Error(response.Errors[0]);
        }

        return response.Result;
    });
}

module.exports = {
    getHotelDeals
};
