const ref = require('../../ref');
const { getCustomerHoldingID } = require('../utils');
const config = require('../../config');
const { getAPIClient } = require('../api');

/**
 * handles customer_bank_transfer_completed event from dwolla
 * @param {string} body.resourceId transfer ID
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCompletedWebhook(body) {
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
                updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'completed';
                updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/updated_at`] = -new Date().valueOf();
                updates[`dwolla/customers/${customerID}/balance`] = bal;
                return ref.update(updates);
            });
        });
    });
}

module.exports = customerBankTransferCompletedWebhook;

/**
return Promise.all([getCustomer(customerID), getBankTransfer(customerID, transferID)]).then(resp => {
    const customer = resp[0];
    const transfer = resp[1];

    if (!transfer) {
        return Promise.reject(new APIError(`Transfer ${transferID} not found`, 404));
    }

    if (!customer) {
        return Promise.reject(new APIError(`Customer ${customerID} not found`, 404));
    }
    const updates = {};

    let amount = transfer.amount * 1;
    if (transfer.type === 'withdraw') {
        amount *= -1;
    }
    */
