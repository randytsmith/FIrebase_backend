const ref = require('../../ref');
const getAPIClient = require('../api');

// @TODO define customerData granually
/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} transferData
 * @returns {Promise<string>} promise of customerID added
 */
// transferData includes fund, process_date, amount
function addDwollaCustomer(userID, transferData) {
    return getAPIClient()
        .then(client => {})
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

module.exports = addDwollaCustomer;
