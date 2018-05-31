const ref = require('../../ref');
const mailer = require('../../mailer');
const fcm = require('../../fcm');

/**
 * unsubscribes user from round up
 * @param {string} userID
 * @returns {Promise<string>}
 */
function removeRoundUp(userID) {
    const update = {};
    update[`dwolla/round_up/${userID}`] = null;

    const message = 'Yes, we know - another confirmation email. Just letting \
    you know, your automatic round up savings have been successfully cancelled';

    mailer.sendTemplateToUser(userID, 'Unubscribed from round-up', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', {}, ' ', message);
    fcm.sendNotificationToUser(userID, 'Unsubscribed from round-up', message);
    return ref.update(update);
}

module.exports = removeRoundUp;
