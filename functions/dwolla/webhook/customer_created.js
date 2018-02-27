const ref = require('../../ref');

/**
 * handles customer_created event from dwolla
 * @param {string} body.resourceId
 * @param {string} body.topic
 * @returns {Promise}
 */
export default function customerCreatedWebhook(body) {
    const cust = body.resourceId;
    const topic = body.topic;

    return ref.child('dwolla_customer/' + cust)
    .once('value')
    .then(snap => snap.val())
    .then(({ email, uid }) => {
        const updates = {};
        updates[`customer/${uid}`] = {
            dwolla_id: cust || null
        };
        return ref.update(updates);
    })
    .then(() => {
        return sendMail(email, topic);
    });
}
