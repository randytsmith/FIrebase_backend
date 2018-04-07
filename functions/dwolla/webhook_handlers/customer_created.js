const ref = require('../../ref');
const mailer = require('../../mailer');
// const fcm = require('../../fcm');
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
        // fcm.sendNotificationToUser(userID, 'Tripents Savings Created!', 'Your dwolla account has been created!').catch(err => console.error(err));
        const message =
            'Congratulations! You’ve successfully opened a travel fund. \
            You’re one step closer to that dream trip you’ve always kept on \
            the backburners, so give yourself a pat on the back. This email \
            also confirms that you accept our secure banking partner Dwolla’s \
            Terms of Service and Privacy Policy. Thanks! -The Tripcents team';
        const bodyDict = {
            test: message
        };
        mailer
            .sendTemplateToUser(userID, 'Dwolla account verified!', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', bodyDict, ' ', ' ')
            .catch(err => console.error(err));
    });
    return ref.update(updates);
}

module.exports = customerCreatedWebhook;
