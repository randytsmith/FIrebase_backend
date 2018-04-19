const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const utils = require('../utils');
// const fcm = require('../../fcm');
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
                // fcm.sendNotificationToUser(userID, 'You are verified', 'Your dwolla account has been verified!').catch(err => console.error(err));
                const message =
                    'Your account has been verified! You can now \
                link a bank account and start saving. Get excited and happy traveling!';
                const bodyDict = {
                    test: message
                };
                mailer
                    .sendTemplateToUser(userID, 'Customer account verified!', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', bodyDict, ' ', message)
                    .catch(err => console.error(err));
            });
            return ref.update(updates);
        });
}

module.exports = customerVerifiedWebhook;
