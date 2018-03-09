const moment = require('moment');
const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerID } = require('../utils');

/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} transferData
 * @returns {Promise<string>} promise of customerID added
 */
function makeDwollaTransfer(userID, transferData) {
    return getAPIClient()
        .then(client => {
            return getCustomerID(userID).then(customerId => {
                const requestBody = {
                    _links: {
                        source: {
                            href: `${config.dwolla.url}/funding-sources/${transferData.fund}`
                        },
                        destination: {
                            href: `${config.dwolla.url}/customers/${customerId}`
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
                    return [customerId, transferId];
                });
            });
        })
        .then(transfer => {
            return ref
                .child('dwolla')
                .child('customers^transfers')
                .child(transfer[0])
                .child(transfer[1])
                .set({ amount: transferData.amount, status: 'pending', type: 'deposit' })
                .then(() => transfer[1]);
        });
}

module.exports = makeDwollaTransfer;
