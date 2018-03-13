const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const utils = require('../utils');
const fcm = require('../../fcm');
const mailer = require('../../mailer');

/**
 * handles customer_verified event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
function customerVerifiedWebhook(body) {
    const customerID = body.resourceId;

    return getAPIClient()
        .then(client => client.get(`${config.dwolla.url}/customers/${customerID}/funding-sources`))
        .then(res => {
            const holdingID = res.body._embedded['funding-sources'][0].id;
            const updates = {};

            updates[`dwolla/customers/${customerID}/status`] = 'verified';
            updates[`dwolla/customers^dwolla_holdings/${customerID}`] = holdingID;

            // lazily send push notification and email
            utils.getUserID(customerID).then(userID => {
                console.log('sending email and push notification');
                fcm.sendNotificationToUser(userID, 'You are verified', 'Your dwolla account has been verified!').catch(err => console.error(err));

                mailer
                    .sendHTMLToUser(userID, 'You are verified', 'Your account has been <b>verified</b>', 'Your account has been verified')
                    .catch(err => console.error(err));
            });

            return ref.update(updates);
        });
}

module.exports = customerVerifiedWebhook;
