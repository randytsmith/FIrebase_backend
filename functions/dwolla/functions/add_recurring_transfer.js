const ref = require('../../ref');
const { getCustomerID } = require('../utils');

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
        const updates = {};

        updates[`dwolla/recurring_transfers^customers/${transferData.process_date}/${customerID}`] = {
            fund_source_id: transferData.fund,
            amount: transferData.amount
        };
        updates[`dwolla/customers^recurring_transfers/${customerID}`] = transferData.process_date;

        return ref.update(updates);
    });
}

module.exports = addRecurringTransfer;
