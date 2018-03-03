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
    const transfer = body.resourceId;
    const updates = {};

    updates[`dwolla_transfers/${customerID}/${transfer}`] = {
        status: 'failed'
    };
    return ref.update(updates);
}

module.exports = customerBankTransferFailedWebhook;
