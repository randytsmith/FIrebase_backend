const ref = require('../../ref');

/**
 * handles customer_suspended event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerSuspendedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};
    updates[`dwolla/customers/${customerID}/status`] = 'suspended';
    return ref.update(updates);
}

module.exports = customerSuspendedWebhook;
