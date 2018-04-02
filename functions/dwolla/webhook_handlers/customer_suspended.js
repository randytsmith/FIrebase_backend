const ref = require('../../ref');
const mailer = require('../../mailer');
const fcm = require('../../fcm');
const utils = require('../utils');

/**
 * handles customer_suspended event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerSuspendedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};
    updates[`dwolla/customers/${customerID}/status`] = 'suspended';
    utils.getUserID(customerID).then(userID => {
        console.log('sending email and push notification');
        fcm.sendNotificationToUser(userID, 'You are verified', 'Your dwolla account has been verified!').catch(err => console.error(err));
        const message = 'Your account has been suspended, please contact tripcents support through the “profile” screen of your app.';
        const bodyDict = {
            body: message
        };
        mailer
            .sendTemplateToUser(
                userID,
                'Dwolla account suspended',
                '196a1c48-5617-4b25-a7bb-8af3863b5fcc',
                bodyDict,
                'customer suspended',
                'customer suspended'
            )
            .catch(err => console.error(err));
    });
    return ref.update(updates);
}

module.exports = customerSuspendedWebhook;
