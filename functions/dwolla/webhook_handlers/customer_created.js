const ref = require('../../ref');
const mailer = require('../../mailer');
const fcm = require('../../fcm');
const utils = require('../utils');

/**
 * handles customer_created event from dwolla
 * @param {string} body.resourceId
 * @returns {Promise}
 */
// customer is being added as verified because in the sandbox
// the verification webhooks sometimes come before created
function customerCreatedWebhook(body) {
    const customerID = body.resourceId;
    const updates = {};
    updates[`dwolla/customers/${customerID}/status`] = 'verified';
    updates[`dwolla/customers/${customerID}/balance`] = 0;
    utils.getUserID(customerID).then(userID => {
        console.log('sending email and push notification');
        fcm.sendNotificationToUser(userID, 'Tripents Savings Created!', 'Your dwolla account has been created!').catch(err => console.error(err));
        const message =
            'Congratulations! You’ve successfully opened a Tripcents savings account. You can now stop daydreaming \
        and start saving for your dream trips! This email also confirms that you accept our secure \
        banking partner Dwolla’s Terms of Service and Privacy Policy. Thanks! -The Tripcents team';
        const bodyDict = {
            body: message
        };
        mailer
            .sendTemplateToUser(userID, 'Dwolla account verified!', '63fc288b-b692-4d2f-a49a-2e8e7ae08263', bodyDict, 'customer created', 'customer created')
            .catch(err => console.error(err));
    });
    return ref.update(updates);
}

module.exports = customerCreatedWebhook;
