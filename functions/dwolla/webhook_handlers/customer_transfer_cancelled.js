const ref = require('../../ref');

/**
 * handles         case "customer_transfer_cancelled":
 event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerTransferCancelledWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transfer = body.resourceId;
    const updates = {};

    updates[`dwolla/customers^transfers/${customerID}/${transfer}/status`] = 'cancelled';
    updates[`dwolla/customers^transfers/${customerID}/${transfer}/updated_at`] = -new Date().valueOf();
    return ref.update(updates);
}

module.exports = customerTransferCancelledWebhook;
