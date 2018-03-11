const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');

/**
 * handles customer_verified event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerVerifiedWebhook(body) {
    const customerID = body.resourceId;

    return getAPIClient()
        .then(client => client.get(`${config.dwolla.url}/funding-sources`))
        .then(res => {
            const holdingID = res.body._embedded['funding-sources'][0].id;
            const updates = {};

            updates[`dwolla/customers/${customerID}/status`] = 'verified';
            updates[`dwolla/customers^dwolla_holdings/${customerID}`] = holdingID;
            return ref.update(updates);
        });
}

module.exports = customerVerifiedWebhook;
