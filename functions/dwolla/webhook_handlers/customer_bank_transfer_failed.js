const ref = require('../../ref');

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
    const updates = {};

    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'failed';
    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/created_at`] = -new Date().valueOf();
    return ref.update(updates);
}

module.exports = customerBankTransferFailedWebhook;
