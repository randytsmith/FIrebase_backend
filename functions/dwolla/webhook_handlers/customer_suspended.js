const ref = require('../../ref');

/**
 * handles customer_suspended event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
export default function customerSuspendedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};

    updates[`dwolla_customer/${customerID}`] = {
        status: 'suspended'
    };
    return ref.update(updates);
}
