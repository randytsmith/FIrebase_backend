const ref = require('../../ref');

/**
 * handles customer_bank_transfer_creation_failed event from dwolla
 * @param {string} body.resourceId transfer ID
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCreationFailedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transfer = body.resourceId;
    const updates = {};

    updates[`dwolla_transfers/${customerID}/${transfer}`] = {
        status: 'creation_failed'
    };
    return ref.update(updates);
}

module.exports = customerBankTransferCreationFailedWebhook;
