const ref = require('../../ref');
const getAPIClient = require('../api');
const getPlaidClient = require('../api');

// @TODO define customerData granually
/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} fundData
 * @returns {Promise<string>} promise of customerID added
 */
function linkFundingSource(userID, fundData) {
    return getPlaidClient()
        .then(client => {
            return client.exchangePublicToken(fundData.publicToken).then(res => {
                client.exchange();
            });
        })
        .then(newCustomer => {
            // @TODO replace id with real id returned from dwolla api response
            const customerID = newCustomer.id;
            return Promise.all([
                ref
                    .child('dwolla')
                    .child('customers')
                    .child(customerID)
                    .set(newCustomer),
                ref
                    .child('dwolla')
                    .child('users^customers')
                    .child(userID)
                    .set(customerID)
            ]).then(() => customerID);
        });
}

module.exports = linkFundingSource;
