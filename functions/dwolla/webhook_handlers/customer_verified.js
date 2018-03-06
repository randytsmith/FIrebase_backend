const ref = require('../../ref');
/**
 * handles customer_verified event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerVerifiedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};
    updates[`dwolla/customers/${customerID}/status`] = 'verified';
    return ref.update(updates);
}

module.exports = customerVerifiedWebhook;
