const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerHoldingID } = require('../utils');

/**
 * fetches and updates dwolla holding balance
 * @param {string} customerID
 * @returns {Promise<string>}
 */
function updateBalance(customerID) {
    return getAPIClient().then(client => {
        return getCustomerHoldingID(customerID).then(holdingID => {
            if (!holdingID) {
                throw new Error(`No dwolla holding account for ${customerID}'`);
            }
            console.log(holdingID);
            return client.get(`${config.dwolla.url}/funding-sources/${holdingID}/balance`).then(res => {
                const bal = res.body.balance.value;
                const updates = {};
                console.log(bal);
                updates[`dwolla/customers/${customerID}/balance`] = bal;
                return ref.update(updates);
            });
        });
    });
}

/**
 * make transfer for all users subscribed to process date
 * @returns {Promise<string>}
 */
function runCron2() {
    return ref
        .child('dwolla')
        .child('customers')
        .once('value')
        .then(snap => snap.val())
        .then(recurringData => {
            const data = recurringData || {};

            return Object.keys(data).reduce((lastPromise, customerID) => {
                // const customerData = data[customerID];
                return lastPromise
                    .then(() => {
                        return updateBalance(customerID);
                    })
                    .then(() => {
                        console.log(`Successfully for ${customerID}`);
                    })
                    .catch(err => {
                        console.error(err);
                        console.log(`Failed for ${customerID}`);
                    });
            }, Promise.resolve());
        });
}

module.exports = runCron2;
