const request = require('request-promise');
const _ = require('lodash');
const config = require('../config');

const DEFAULT_FILTERS = {
    noRideshare: true,
    noRail: true,
    noBus: true,
    noFerry: true,
    noCar: true,
    noBikeshare: true,
    noTowncar: true,
    noCommuter: true,
    noSpecial: true
};

function meanBy(array, field) {
    const result = _.meanBy(array, field);

    if (isNaN(result)) {
        return 0;
    }

    return result.toFixed(2) * 1;
}

/**
 * @param {Number} params.oPos.lat
 * @param {Number} params.oPos.lng
 * @param {Number} params.dPos.lat
 * @param {Number} params.dPos.lng
 */
function getEstimation(params) {
    const payload = {
        uri: `${config.rome2rio.apiBase}/json/Search`,
        qs: _.extend({}, DEFAULT_FILTERS, params, {
            key: config.rome2rio.apiKey
        }),
        json: true
    };

    return request(payload)
    .then(response => {
        const routes = _.get(response, 'routes', []);
        let prices = [];

        _.each(routes, route => {
            prices = prices.concat(route.indicativePrices);
        });

        return {
            price: meanBy(prices, 'price'),
            priceLow: meanBy(prices, 'priceLow'),
            priceHigh: meanBy(prices, 'priceHigh'),
            duration: meanBy(routes, 'totalDuration'),
            distance: meanBy(routes, 'distance')
        };
    });
}

module.exports = {
    getEstimation
};
