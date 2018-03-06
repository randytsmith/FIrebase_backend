const ref = require('../../ref');

/**
 * handles customer_activated event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerActivatedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};
    updates[`dwolla/customers/${customerID}/status`] = 'activated';
    return ref.update(updates);
}

module.exports = customerActivatedWebhook;
