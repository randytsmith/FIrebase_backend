// const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerID } = require('../utils');

/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} transferData
 * @returns {Promise<string>} promise of transfer cancelled
 */

function updateDwollaCustomer(userID, customerData) {
    return getAPIClient().then(client => {
        return getCustomerID(userID).then(customerID => {
            const url = `${config.dwolla.url}/customers/${customerID}`;
            return client.post(url, customerData).then(res => {
                return res.body.id;
            });
        });
    });
    // .then(id => {
    //     const updates = {};
    //     updates[`dwolla/customers/${id}/status`] = ;
    //     updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = status;
    //     return ref.update(updates).then(() => status);
    // });
}

module.exports = updateDwollaCustomer;
