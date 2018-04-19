const ref = require('../../ref');
const mailer = require('../../mailer');
// const fcm = require('../../fcm');
const utils = require('../utils');
/**
 * handles customer_activated event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerActivatedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};
    updates[`dwolla/customers/${customerID}/status`] = 'activated';
    utils.getUserID(customerID).then(userID => {
        console.log('sending email and push notification');
        // fcm.sendNotificationToUser(userID, 'You are deactivated', 'Your dwolla account has been deactivated').catch(err => console.error(err));
        const message = 'Your account has been activated, please contact tripcents support through the “profile” screen of your app.';
        const bodyDict = {
            // test: message
        };
        mailer
            .sendTemplateToUser(userID, 'Dwolla account activated', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', bodyDict, ' ', message)
            .catch(err => console.error(err));
    });
    return ref.update(updates);
}

module.exports = customerActivatedWebhook;
