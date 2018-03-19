const ref = require('../../ref');

/**
 * handles customer_created event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
// customer is being added as verified because in the sandbox
// the verification webhooks sometimes come before created
function customerCreatedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};
    updates[`dwolla/customers/${customerID}/status`] = 'verified';
    updates[`dwolla/customers/${customerID}/balance`] = 0;
    return ref.update(updates);
}

module.exports = customerCreatedWebhook;
Í;
