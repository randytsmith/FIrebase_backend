const moment = require('moment');
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
function makeDwollaTransfer(userID, transferData) {
    return getAPIClient()
        .then(client => {
            return getCustomerHoldingID(transferData.customer_id).then(holdingID => {
                const requestBody = {
                    _links: {
                        source: {
                            href: `${config.dwolla.url}/funding-sources/${transferData.fund}`
                        },
                        destination: {
                            href: `${config.dwolla.url}/funding-sources/${holdingID}`
                        }
                    },
                    amount: {
                        currency: 'USD',
                        value: transferData.amount
                    },
                    metadata: {
                        note: `One time transfer on ${moment().format('MM/DD/YYYY')}`
                    },
                    clearing: {
                        destination: 'next-available',
                        source: 'standard'
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
                .set({ amount: transferData.amount, status: 'pending', type: 'deposit' })
                .then(() => transfer);
        });
}

module.exports = makeDwollaTransfer;
