const ref = require('../../ref');
const { getRecurringTransferProcessDate } = require('../utils');

/**
 * subscribes user from recurring transfer
 * @param {string} userID
 * @returns {Promise<string>}
 */
function cancelRecurringTransfer(userID, transferData) {
    const customerID = transferData.customer_id;
    return getRecurringTransferProcessDate(customerID).then(processDate => {
        const updates = {};

        updates[`dwolla/recurring_transfers^customers/${processDate}/${customerID}`] = null;
        updates[`dwolla/customers^recurring_transfers/${customerID}`] = null;
        updates[`dwolla/users^recurring_transfers/${userID}`] = false;

        return ref.update(updates);
    });
}

module.exports = cancelRecurringTransfer;
