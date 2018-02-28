const ref = require('../../ref');

/**
 * handles customer_deactivated event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
export default function customerDeactivatedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};

    updates[`dwolla_customer/${customerID}`] = {
        status: 'deactivated'
    };
    return ref.update(updates);
}
