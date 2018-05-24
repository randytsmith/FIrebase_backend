const ref = require('../../ref');
const { getCustomerID } = require('../utils');
const mailer = require('../../mailer');
const fcm = require('../../fcm');

/**
 * subscribes user for round up
 * @param {string} userID
 * @param {string} roundupData.fund fund source id
 * @returns {Promise<string>}
 */
function addRoundUp(userID, roundUpData) {
    return getCustomerID(userID)
        .then(customerID => {
            const update = {};
            update[`dwolla/round_up/${userID}`] = {
                customer_id: customerID,
                fund_source_id: roundUpData.fund,
                bank_name: roundUpData.bank_name
            };

            const message = 'Nice! You have subscribed to round-up feature!';

            mailer.sendTemplateToUser(
                userID,
                'Subscribed to round-up',
                '196a1c48-5617-4b25-a7bb-8af3863b5fcc',
                {},
                ' ',
                message
            );
            fcm.sendNotificationToUser(userID, 'Subscribed to round-up', message);
            return ref.update(update);
        });
}

module.exports = addRoundUp;
