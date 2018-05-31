const ref = require('../../ref');
const { getCustomerID } = require('../utils');
const mailer = require('../../mailer');
const fcm = require('../../fcm');

/**
 * subscribes user for round up
 * @param {string} userID
 * @param {string} roundupData.fund fund source id
 * @param {number} roundupData.additional_dollar
 * @param {number} roundUpData.recurring_plan
 * @returns {Promise<string>}
 */
function addRoundUp(userID, roundUpData) {
    return getCustomerID(userID).then(customerID => {
        const update = {};
        update[`dwolla/round_up/${userID}`] = {
            customer_id: customerID,
            fund_source_id: roundUpData.fund,
            bank_name: roundUpData.bank_name,
            additional_dollar: roundUpData.additional_dollar || 0,
            recurring_plan: roundUpData.recurring_plan || 'weekly'
        };

        const message = `YAS! Your automatic round up savings have been set \
            up successfully. We’ll now save the change from rounding up your \
            purchases to the nearest ${roundUpData.additional_dollar}. \
            Want to hear the breakdown? No? Well too bad - here’s how it works, \
            we calculate the spare change from your roundUpData.bank_name transactions and \
            transfer it to your Travel Fund ${roundUpData.recurring_plan}`;

        mailer.sendTemplateToUser(userID, 'Subscribed to round-up', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', {}, ' ', message);
        fcm.sendNotificationToUser(userID, 'Subscribed to round-up', message);
        return ref.update(update);
    });
}

module.exports = addRoundUp;
