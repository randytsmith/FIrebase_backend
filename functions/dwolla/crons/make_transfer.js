const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerHoldingID, getRecurringTransferStatus } = require('../utils');

/**
 * makes recurring transfer
 * @param {string} customerID
 * @param {enum["1", "15"]} processDate
 * @param {Object} transferData
 * @returns {Promise<string>}
 */
function makeTransfer(customerID, processDate, transferData) {
    return getAPIClient()
        .then(client => {
            return getCustomerHoldingID(customerID).then(holdingID => {
                if (!holdingID) {
                    throw new Error(`No dwolla holding account for ${customerID}'`);
                }
                return getRecurringTransferStatus(customerID, processDate).then(status => {
                    if (!status || status !== 'active') {
                        throw new Error(`Transfer is not currently active for ${customerID}`);
                    }

                    const requestBody = {
                        _links: {
                            source: {
                                href: `${config.dwolla.url}/funding-sources/${transferData.fund_source_id}`
                            },
                            destination: {
                                href: `${config.dwolla.url}/funding-sources/${holdingID}`
                            }
                        },
                        amount: {
                            currency: 'USD',
                            value: Number(transferData.amount).toFixed(2)
                        }
                    };

                    console.log(requestBody);

                    return client.post('transfers', requestBody);
                });
            });
        })
        .then(res => res.headers.get('location'))
        .then(transferUrl => {
            const transferId = transferUrl.substr(transferUrl.lastIndexOf('/') + 1);
            return ref
                .child('dwolla')
                .child('customers^bank_transfers')
                .child(customerID)
                .child(transferId)
                .set({
                    amount: transferData.amount,
                    status: 'pending',
                    type: 'deposit',
                    created_at: -new Date().valueOf(),
                    updated_at: -new Date().valueOf(),
                    bank_name: transferData.bank_name
                })
                .then(() => transferUrl);
        });
}

/**
 * updates recurring transfer data with latest timestamp and status
 * @param {string} customerID
 * @param {enum["1", "15"]} processDate
 * @returns {Promise<string>}
 */
function updateRecurringTransferData(customerID, processDate, data) {
    const updates = {};
    Object.keys(data).forEach(key => {
        updates[`dwolla/recurring_transfers^customers/${processDate}/${customerID}/${key}`] = data[key];
    });
    return ref.update(updates);
}

/**
 * make transfer for all users subscribed to process date
 * @param {enum["1", "15"]} processDate
 * @returns {Promise<string>}
 */
function runCron(processDate) {
    return ref
        .child('dwolla')
        .child('recurring_transfers^customers')
        .child(processDate)
        .once('value')
        .then(snap => snap.val())
        .then(recurringData => {
            const data = recurringData || {};

            return Object.keys(data).reduce((lastPromise, customerID) => {
                const transferData = data[customerID];
                console.log(`making payment for ${customerID} - ${transferData.amount}`);
                return lastPromise
                    .then(() => {
                        return makeTransfer(customerID, processDate, transferData);
                    })
                    .then(() => {
                        console.log(`Successfully captured ${transferData.amount} for ${customerID}`);
                        updateRecurringTransferData(customerID, processDate, {
                            last_status: 'success',
                            timestamp: new Date().valueOf()
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        console.log(`Failed to capture payment for ${customerID}`);
                        updateRecurringTransferData(customerID, processDate, {
                            last_status: 'failure',
                            timestamp: new Date().valueOf()
                        });
                    });
            }, Promise.resolve());
        });
}

module.exports = runCron;
