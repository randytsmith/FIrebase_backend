const ref = require('../../ref');

/**
 * handles customer_created event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerCreatedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};
    updates[`dwolla/customers/${customerID}/status`] = 'created';
    updates[`dwolla/customers/${customerID}/balance`] = 0;
    return ref.update(updates);
}

module.exports = customerCreatedWebhook;
