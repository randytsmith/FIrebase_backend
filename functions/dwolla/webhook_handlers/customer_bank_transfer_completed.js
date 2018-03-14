const ref = require('../../ref');
const APIError = require('../../common/ApiError');
const { getCustomer, getBankTransfer } = require('../utils');

/**
 * handles customer_bank_transfer_completed event from dwolla
 * @param {string} body.resourceId transfer ID
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCompletedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transferID = body.resourceID;

    return Promise.all([getCustomer(customerID), getBankTransfer(customerID, transferID)]).then(resp => {
        const customer = resp[0];
        const transfer = resp[1];

        if (!transfer) {
            return Promise.reject(new APIError(`Transfer ${transferID} not found`, 404));
        }

        if (!customer) {
            return Promise.reject(new APIError(`Customer ${customerID} not found`, 404));
        }
        console.log(transfer);
        console.log(customer);

        const updates = {};

        let amount = transfer.amount * 1;
        if (transfer.type === 'withdraw') {
            amount *= -1;
        }

        updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'completed';
        updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/updated_at`] = -new Date().valueOf();
        updates[`dwolla/customers/${customerID}/balance`] = (customer.balance * 1 || 0) + amount;

        return ref.update(updates);
    });
}

module.exports = customerBankTransferCompletedWebhook;
