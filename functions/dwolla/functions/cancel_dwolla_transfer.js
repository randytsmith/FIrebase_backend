const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const crypto = require('crypto');

/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} transferData
 * @returns {Promise<string>} promise of transfer cancelled
 */

function cancelDwollaTransfer(userID, transferData) {
    const transferID = transferData.transfer_id;
    return getAPIClient()
        .then(client => {
            const url = `${config.dwolla.url}/transfers/${transferID}`;
            const request_body = {
                status: 'cancelled'
            };
            return client.post(url, request_body).then(res => {
                return res.body.status;
            });
        })
        .then(status => {
            const updates = {};
            const customerID = transferData.customer_id;
            const key = crypto.randomBytes(10).toString('hex');
            updates[`dwolla/users^bank_transfers/${userID}`] = key;
            updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = status;
            return ref.update(updates).then(() => status);
        });
}

module.exports = cancelDwollaTransfer;
