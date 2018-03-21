const ref = require('../../ref');
const { getRecurringTransferProcessDate, getCustomerID } = require('../utils');

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
                    status: 'active'
                };
                updates2[`dwolla/customers^recurring_transfers/${customerID}`] = transferData.process_date;

                return ref.update(updates2);
            });
    });
}

module.exports = addRecurringTransfer;
