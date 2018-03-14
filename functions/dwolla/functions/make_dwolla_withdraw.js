const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerHoldingID } = require('../utils');

/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} transferData
 * @returns {Promise<string>} promise of customerID added
 */
function makeDwollaWithdraw(userID, transferData) {
    return getAPIClient()
        .then(client => {
            return getCustomerHoldingID(transferData.customer_id).then(holdingId => {
                const requestBody = {
                    _links: {
                        source: {
                            href: `${config.dwolla.url}/funding-sources/${holdingId}`
                        },
                        destination: {
                            href: `${config.dwolla.url}/funding-sources/${transferData.fund}`
                        }
                    },
                    amount: {
                        currency: 'USD',
                        value: transferData.amount
                    }
                };
                return client.post('transfers', requestBody).then(res => {
                    const transferUrl = res.headers.get('location');
                    const transferId = transferUrl.substr(transferUrl.lastIndexOf('/') + 1);
                    return transferId;
                });
            });
        })
        .then(transfer => {
            return ref
                .child('dwolla')
                .child('customers^bank_transfers')
                .child(transferData.customer_id)
                .child(transfer)
                .set({
                    amount: transferData.amount,
                    status: 'pending',
                    type: 'withdraw',
                    created_at: -new Date().valueOf(),
                    updated_at: -new Date().valueOf()
                })
                .then(() => transfer);
        });
}

module.exports = makeDwollaWithdraw;
