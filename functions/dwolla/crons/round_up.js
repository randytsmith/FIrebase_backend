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

/**
 * processes round up of all plaid transactions during the week
 * @param {string} userID
 * @param {string} roundUpData.plaid_account_id
 * @param {string} roundUpData.additional_dollar
 * @returns {Promise<string>}
 */
function processRoundUp(userID, roundUpData) {
    const plaid = getPlaidClient();
    const startDate = moment().startOf('week').format('YYYY-MM-DD');
    const endDate = moment().endOf('week').format('YYYY-MM-DD');

    if (roundUpData.plaid_access_token) {
        return Promise.reject(new Error('Plaid access token not found'));
    }

    return plaid.getTransactions(roundUpData.plaid_access_token, startDate, endDate)
        .then(transactions => {
            const sum = transactions.reduce((total, transaction) => {
                if (transaction.amount > 0) {
                    return Math.ceil(transaction.amount) - transaction.amount;
                }

                return total;
            }, roundUpData.additional_dollar);

            return getAPIClient()
            .then(dwolla => {
                return getHoldingID()
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
                        return processRoundUp(userID, Object.assign({}, customerData, fundSourceData));
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
