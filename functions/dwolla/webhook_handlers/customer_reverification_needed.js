const ref = require('../../ref');

/**
 * handles customer_reverification_needed event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerReverificationNeededWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};

    updates[`dwolla_customer/${customerID}`] = {
        status: 'reverification'
    };
    return ref.update(updates);
}

module.exports = customerReverificationNeededWebhook;
