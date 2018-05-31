const moment = require('moment');
const ref = require('../../ref');
const { getCustomerID, getCustomerHoldingID, getFundingSourceData } = require('../utils');
const { getAPIClient, getPlaidClient } = require('../api');

const config = require('../../config');

function getHoldingID(userID) {
    return getCustomerID(userID)
    .then(customerID => getCustomerHoldingID(customerID));
}

function getFundSource(userID, fundSourceID) {
    return getCustomerID(userID)
    .then(customerID => getFundingSourceData(customerID, fundSourceID));
}

function saveTransaction(customerID, transaction, charge, additionalDollar) {
    return ref
        .child('dwolla')
        .child('customers^plaid_transactions')
        .child(customerID)
        .child(transaction.date)
        .child(transaction.transaction_id)
        .set(Object.assign({}, transaction, {
            charge,
            additionalDollar,
            timestamp: new Date().valueOf()
        }));
}

function saveRoundUp(customerID, today, startDate, endDate) {
    return ref
        .child('dwolla')
        .child('customers^roundup_history')
        .child(customerID)
        .child(today)
        .set({
            start_date: startDate,
            end_date: endDate
        });
}

/**
 * processes round up of all plaid transactions during the week
 * @param {string} userID
 * @param {string} roundUpData.plaid_account_id
 * @param {string} roundUpData.additional_dollar
 * @returns {Promise<string>}
 */
function processRoundUp(userID, roundUpData, recurringPlan) {
    const plaid = getPlaidClient();
    const dayMap = {
        weekly: 7,
        'bi-weekly': 14,
        monthly: 30
    };

    const days = dayMap[recurringPlan];
    const startDate = moment().subtract(days, 'days').startOf('day').format('YYYY-MM-DD');
    const endDate = moment().endOf('day').format('YYYY-MM-DD');

    if (!roundUpData.plaid_access_token) {
        return Promise.reject(new Error('Plaid access token not found'));
    }

    return plaid.getTransactions(roundUpData.plaid_access_token, startDate, endDate)
        .then(resp => {
            const sum = resp.transactions.reduce((total, transaction) => {
                if (transaction.amount > 0) {
                    const amount = (Math.ceil(transaction.amount) - transaction.amount) + (roundUpData.additional_dollar || 0);

                    saveTransaction(roundUpData.customer_id, transaction, amount, (roundUpData.additional_dollar || 0));

                    return total + amount;
                }

                return total;
            }, 0);

            if (!sum || !resp.transactions.length) {
                return Promise.resolve('No transaction to make round up');
            }

            saveRoundUp(roundUpData.customer_id, moment().format('YYYY-MM-DD'), startDate, endDate);

            return getAPIClient()
            .then(dwolla => {
                return getHoldingID(userID)
                .then(holdingID => {
                    const requestBody = {
                        _links: {
                            source: {
                                href: `${config.dwolla.url}/funding-sources/${roundUpData.fund_source_id}`
                            },
                            destination: {
                                href: `${config.dwolla.url}/funding-sources/${holdingID}`
                            }
                        },
                        amount: {
                            currency: 'USD',
                            value: sum
                        }
                    };

                    console.log(requestBody);

                    return dwolla.post('transfers', requestBody);
                });
            });
        });
}

function checkAllUsersRoundUp(recurringPlan) {
    return ref.child('dwolla')
        .child('round_up')
        .once('value')
        .then(snap => snap.val())
        .then(roundUpData => {
            const data = roundUpData || {};

            return Object.keys(data).reduce((lastPromise, userID) => {
                const customerData = data[userID];
                if (recurringPlan !== customerData.recurring_plan) {
                    console.log(`Skipping because ${recurringPlan} !== ${customerData.recurring_plan}`);
                    return lastPromise;
                }

                return lastPromise
                    .then(() => getFundSource(userID, customerData.fund_source_id))
                    .then(fundSourceData => {
                        return processRoundUp(userID, Object.assign({}, customerData, fundSourceData), recurringPlan);
                    })
                    .then(sum => {
                        console.log(`Successfully finished round up ${sum} for ${userID}`);
                    })
                    .catch(err => {
                        console.error(err);
                        console.log(`Failed round up for ${userID}`);
                    });
            }, Promise.resolve());
        });
}

module.exports = checkAllUsersRoundUp;
