const ref = require('../../ref');

/**
 * handles customer_transfer_created event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerTransferCreatedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transfer = body.resourceId;
    const updates = {};

    updates[`dwolla/customers^transfers/${customerID}/${transfer}/status`] = 'pending';
    updates[`dwolla/customers^transfers/${customerID}/${transfer}/created_at`] = -new Date().valueOf();
    updates[`dwolla/customers^transfers/${customerID}/${transfer}/updated_at`] = -new Date().valueOf();
    return ref.update(updates);
}

module.exports = customerTransferCreatedWebhook;
