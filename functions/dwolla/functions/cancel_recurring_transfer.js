const ref = require('../../ref');
const { getCustomerID, getRecurringTransferProcessDate } = require('../utils');

/**
 * subscribes user from recurring transfer
 * @param {string} userID
 * @returns {Promise<string>}
 */
function cancelRecurringTransfer(userID) {
    return getCustomerID(userID).then(customerID => {
        return getRecurringTransferProcessDate(customerID).then(processDate => {
            const updates = {};

            updates[`dwolla/recurring_transfers^customers/${processDate}/${customerID}`] = null;
            updates[`dwolla/customers^recurring_transfers/${customerID}`] = null;

            return ref.update(updates);
        });
    });
}

module.exports = cancelRecurringTransfer;
