const ref = require('../../ref');

// @TODO ordering by timestamp descending & grab transferred amount from dwolla
/**
 * handles customer_bank_transfer_completed event from dwolla
 * @param {string} body.resourceId transfer ID
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCompletedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transfer = body.resourceId;
    const updates = {};

    updates[`dwolla_transfers/${customerID}/${transfer}`] = {
        status: 'completed',
        timestamp: new Date().valueOf()
    };
    return ref.update(updates);
}

module.exports = customerBankTransferCompletedWebhook;
