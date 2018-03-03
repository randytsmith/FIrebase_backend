const ref = require('../../ref');

/**
 * handles customer_created event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerCreatedWebhook(body) {
    const customerID = body.resourceId;

    return ref
        .child(`dwolla_customer/${customerID}`)
        .once('value')
        .then(snap => snap.val())
        .then(({ uid }) => {
            const updates = {};
            updates[`customer/${uid}`] = {
                dwolla_id: customerID || null
            };
            return ref.update(updates);
        });
}

module.exports = customerCreatedWebhook;
