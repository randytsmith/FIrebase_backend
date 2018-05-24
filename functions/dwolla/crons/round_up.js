const moment = require('moment');
const ref = require('../../ref');
const { getCustomerID, getCustomerHoldingID } = require('../utils');
const { getAPIClient, getPlaidClient } = require('../api');

const config = require('../../config');

function getHoldingID(userID) {
    return getCustomerID(userID)
    .then(customerID => getCustomerHoldingID(customerID));
}

/**
 * processes round up of all plaid transactions during the week
 * @param {string} userID
 * @param {string} roundUpData.plaid_account_id
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
            }, 0);

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

function checkAllUsersRoundUp() {
    return ref.child('dwolla')
        .child('round_up')
        .once('value')
        .then(snap => snap.val())
        .then(roundUpData => {
            const data = roundUpData || {};

            return Object.keys(data).reduce((lastPromise, userID) => {
                const customerData = data[userID];
                return lastPromise
                    .then(() => {
                        return processRoundUp(userID, customerData);
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
