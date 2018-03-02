const ref = require('../../ref');

/**
 * handles customer_activated event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
export default function customerActivatedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};

    updates[`dwolla_customer/${customerID}`] = {
        status: 'activated'
    };
    return ref.update(updates);
}
