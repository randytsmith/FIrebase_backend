const moment = require('moment');
const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');

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
            const requestBody = {
                _links: {
                    source: {
                        href: `${config.dwolla.url}/funding-sources/${transferData.fund_source_id}`
                    },
                    destination: {
                        href: `${config.dwolla.url}/customers/${customerID}`
                    }
                },
                amount: {
                    currency: 'USD',
                    value: transferData.amount
                },
                metadata: {
                    note: `Recurring capture on ${moment().format('MM/DD/YYYY')}`
                },
                clearing: {
                    destination: 'next-available'
                },
                correlationId: '8a2cdc8d-629d-4a24-98ac-40b735229fe2'
            };

            return client.post('transfers', requestBody);
        })
        .then(res => res.headers.get('location'));
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
        .child('recurring_transfers^customerID')
        .child(processDate)
        .once('value')
        .then(snap => snap.val())
        .then(recurringData => {
            const data = recurringData || {};
            console.log(data);

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
