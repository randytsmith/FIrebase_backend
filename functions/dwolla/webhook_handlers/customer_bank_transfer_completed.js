const ref = require('../../ref');

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
    const updates = {};

    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'completed';
    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/updated_at`] = -new Date().valueOf();
    return ref.update(updates);
}

module.exports = customerBankTransferCompletedWebhook;
