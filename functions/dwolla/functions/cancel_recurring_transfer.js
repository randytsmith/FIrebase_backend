const ref = require('../../ref');
const getAPIClient = require('../api');

// @TODO define customerData granually
/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} customerData
 * @returns {Promise<string>} promise of customerID added
 */
function addDwollaCustomer(userID, transferData) {
    return getAPIClient()
        .then(client => {
            console.log('in add dwolla customer');
            return client.post('customers', customerData);
        })
        .then(newCustomer => {
            // @TODO replace id with real id returned from dwolla api response
            const customerURL = newCustomer.headers.get('location');
            const customerID = customerUrl.substr(customerUrl.lastIndexOf('/') + 1);
            return Promise.all([
                ref
                    .child('dwolla')
                    .child('customers')
                    .child(customerID)
                    .set({customerData, href: customerURL, status:"pending"}),
                ref
                    .child('dwolla')
                    .child('users^customers')
                    .child(userID)
                    .set(customerID),
                ref
                    .child('dwolla')
                    .child('customers^users')
                    .child(customerID)
                    .set(userID)
            ]).then(() => customerID);
        });
}

module.exports = cancel_recurring_transfer;
