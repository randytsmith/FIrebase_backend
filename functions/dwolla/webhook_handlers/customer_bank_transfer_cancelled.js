const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerHoldingID } = require('../utils');

/**
 * handles customer_bank_transfer_cancelled event from dwolla
 * @param {string} body.resourceId transfer ID
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCancelledWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transferID = body.resourceId;
    return getAPIClient().then(client => {
        return getCustomerHoldingID(customerID).then(holdingID => {
            if (!holdingID) {
                throw new Error(`No dwolla holding account for ${customerID}'`);
            }
            return client.get(`${config.dwolla.url}/funding-sources/${holdingID}/balance`).then(res => {
                const bal = res.body.balance.value;
                const updates = {};
                updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'cancelled';
                updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/updated_at`] = -new Date().valueOf();
                updates[`dwolla/customers/${customerID}/balance`] = bal;
                return ref.update(updates);
            });
        });
    });
}

module.exports = customerBankTransferCancelledWebhook;
