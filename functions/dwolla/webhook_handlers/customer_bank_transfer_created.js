const ref = require('../../ref');

/**
 * handles customer_bank_transfer_created event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCreatedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transferID = body.resourceId;
    const updates = {};

    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'created';
    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/created_at`] = -new Date().valueOf();
    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/updated_at`] = -new Date().valueOf();
    return ref.update(updates);
}

module.exports = customerBankTransferCreatedWebhook;
