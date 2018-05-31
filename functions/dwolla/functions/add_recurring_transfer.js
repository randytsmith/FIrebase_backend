const ref = require('../../ref');
const { getRecurringTransferProcessDate, getCustomerID } = require('../utils');
const mailer = require('../../mailer');
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

                if (!processDate) {
                    return Promise.resolve();
                }

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
                let suffix = '';
                if (+transferData.process_date === 1) {
                    suffix = 'st';
                } else {
                    suffix = 'th';
                }
                console.log('sending email and push notification');
                const message = `Nice! You’ve scheduled a recurring transfer for $${transferData.amount}.00\
                 to be transfered on the ${transferData.process_date}${suffix} of each month, from \
                 ${transferData.bank_name} to your Travel Fund. Just sit back, relax, and watch \
                 as your travel fund fulfills its potential. You can contact tripcents support \
                 through the “profile” screen of your app.`;
                const bodyDict = {
                    // test: message
                };
                mailer
                    .sendTemplateToUser(userID, 'Recurring Transfer Scheduled', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', bodyDict, ' ', message)
                    .catch(err => console.error(err));

                return ref.update(updates2);
            });
    });
}

module.exports = addRecurringTransfer;
