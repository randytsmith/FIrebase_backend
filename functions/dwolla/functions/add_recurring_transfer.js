const ref = require('../../ref');
const { getRecurringTransferProcessDate, getCustomerID } = require('../utils');
const mailer = require('../../mailer');
const fcm = require('../../fcm');

/**
 * subscribes user for recurring transfer
 * @param {string} userID
 * @param {enum["1", "15"]} transferData.process_date
 * @param {Number} transferData.amount
 * @param {string} transferData.fund fund source id
 * @returns {Promise<string>}
 */
function addRecurringTransfer(userID, transferData) {
    return getCustomerID(userID).then(customerID => {
        return getRecurringTransferProcessDate(customerID)
            .then(processDate => {
                const updates = {};

                updates[`dwolla/recurring_transfers^customers/${processDate}/${customerID}`] = null;
                updates[`dwolla/customers^recurring_transfers/${customerID}`] = null;

                return ref.update(updates);
            })
            .then(() => {
                const updates2 = {};
                updates2[`dwolla/recurring_transfers^customers/${transferData.process_date}/${customerID}`] = {
                    fund_source_id: transferData.fund,
                    amount: transferData.amount,
                    status: 'active',
                    bank_name: transferData.bank_name
                };
                updates2[`dwolla/customers^recurring_transfers/${customerID}`] = transferData.process_date;
                updates2[`dwolla/users^recurring_transfers/${userID}`] = true;

                console.log('sending email and push notification');
                fcm.sendNotificationToUser(userID, 'Recurring transfer created', 'Recurring transfer created').catch(err => console.error(err));
                const message = `You’ve scheduled a recurring transfer for\
                 ${transferData.amount} to be transferred on the ${transferData.process_date} of each month, from \
                 ${transferData.bank_name} to your Travel Account. Just sit back, relax and let \
                 us automate the saving for you. You can contact tripcents support \
                 through the “profile” screen of your app.`;
                const bodyDict = {
                    body: message
                };
                mailer
                    .sendTemplateToUser(
                        userID,
                        'Recurring Transfer Scheduled',
                        '63fc288b-b692-4d2f-a49a-2e8e7ae08263',
                        bodyDict,
                        'recurring transfer scheduled',
                        'recurring transfer scheduled'
                    )
                    .catch(err => console.error(err));

                return ref.update(updates2);
            });
    });
}

module.exports = addRecurringTransfer;
