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

/**
 * @param {string} params.oPos lat lng delimited by comma e.g: "37.792,-122.397"
 * @param {string} params.dPos
 */
function getEstimation(uid, params) {
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
        const results = [];

        _.each(routes, route => {
            _.each(route.segments, segment => {
                const from = _.get(response, `places.${segment.depPlace}`, '');
                const to = _.get(response, `places.${segment.arrPlace}`, '');

                results.push({
                    from,
                    to,
                    priceMedian: _.get(segment, 'indicativePrices.0.price', 0),
                    price: _.get(segment, 'indicativePrices.0.priceLow', 0),
                    priceHigh: _.get(segment, 'indicativePrices.0.priceHigh', 0),
                    returnPriceMedian: _.get(segment, 'return.0.indicativePrices.0.price', 0),
                    returnPrice: _.get(segment, 'return.0.indicativePrices.0.priceLow', 0),
                    returnPriceHigh: _.get(segment, 'return.0.indicativePrices.0.priceHigh', 0),
                    distance: segment.distance,
                    transitDuration: segment.transitDuration,
                    transferDuration: segment.transferDuration
                });
            });
        });

        return results;
    });
}

module.exports = {
    getEstimation
};
