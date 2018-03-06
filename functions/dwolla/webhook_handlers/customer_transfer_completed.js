const ref = require('../../ref');
const APIError = require('../../common/ApiError');
const { getCustomer, getTransfer } = require('../utils');

/**
 * handles customer_transfer_completed event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerTransferCompletedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transferID = body.resourceId;

    return Promise.all([getCustomer(customerID), getTransfer(customerID, transferID)]).then(resp => {
        const customer = resp[0];
        const transfer = resp[1];

        if (!transfer) {
            return Promise.reject(new APIError(`Transfer ${transferID} not found`, 404));
        }

        if (!customer) {
            return Promise.reject(new APIError(`Customer ${customerID} not found`, 404));
        }

        const updates = {};
        updates[`dwolla/customers^transfers/${customerID}/${transferID}/status`] = 'completed';
        updates[`dwolla/customers^transfers/${customerID}/${transferID}/updated_at`] = -new Date().valueOf();
        updates[`dwolla/customers/${customerID}/balance`] = (customer.balance || 0) + transfer.amount;
        return ref.update(updates);
    });
}

module.exports = customerTransferCompletedWebhook;
