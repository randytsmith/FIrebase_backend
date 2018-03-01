const ref = require('../../ref');
const getAPIClient = require('../api');

// @TODO define customerData granually
/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} customerData
 * @returns {Promise<string>} promise of customerID added
 */
export default function addDwollaCustomer(userID, customerData) {
    return getAPIClient()
        .then(client => {
            // @NOTE just mock call for creating customer for now
            // @TODO change this with real dwolla API request
            return client.addCustomer(customerData);
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
