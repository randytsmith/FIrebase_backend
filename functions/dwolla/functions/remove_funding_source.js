const ref = require('../../ref');
const { getAPIClient } = require('../api');
const { getCustomerID } = require('../utils');
const config = require('../../config');

// @TODO define customerData granually
/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} fundData
 * @returns {Promise<string>} promise of customerID added
 */
function removeFundingSource(userID, fundData) {
    return getAPIClient()
        .then(client => {
            const funding_source_url = `${config.dwolla.url}/funding-sources/${fundData.fund}`;
            const request_body = {
                removed: true
            };
            return client.post(funding_source_url, request_body);
        })
        .then(() => {
            return getCustomerID().then(customerId => {
                const updates = {};
                updates[`dwolla/customers^funding_source/${customerId}/${fundData.fund}/status`] = 'removed';
                return ref.update(updates);
            });
        });
}

module.exports = removeFundingSource;
