const ref = require('../../ref');

/**
 * handles customer_transfer_failed event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerTransferFailedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transfer = body.resourceId;
    const updates = {};

    updates[`dwolla/customers^transfers/${customerID}/${transfer}/status`] = 'failed';
    updates[`dwolla/customers^transfers/${customerID}/${transfer}/updated_at`] = -new Date().valueOf();

    return ref.update(updates);
}

module.exports = customerTransferFailedWebhook;
