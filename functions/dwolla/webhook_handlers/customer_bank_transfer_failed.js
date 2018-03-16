const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerHoldingID } = require('../utils');
/**
 * handles customer_bank_transfer_failed event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferFailedWebhook(body) {
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
                updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'failed';
                updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/created_at`] = -new Date().valueOf();
                updates[`dwolla/customers/${customerID}/balance`] = bal;
                return ref.update(updates);
            });
        });
    });
}

module.exports = customerBankTransferFailedWebhook;
