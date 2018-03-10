const ref = require('../../ref');
const { getAPIClient } = require('../api');
const { getPlaidClient } = require('../api');
const config = require('../../config');
const { getCustomerID } = require('../utils');

// @TODO define customerData granually
/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} fundData
 * @returns {Promise<string>} promise of customerID added
 */
function linkFundingSource(userID, fundData) {
    const acctId = fundData.metaData.account_id;
    console.log(acctId);
    return getCustomerID(userID)
        .then(customerID => {
            return getPlaidClient().then(plaid_client => {
                return plaid_client.exchangePublicToken(fundData.publicToken).then(plaid_res1 => {
                    const access_token = plaid_res1.access_token;
                    console.log(access_token);
                    return plaid_client.createProcessorToken(access_token, acctId, 'dwolla').then(plaid_res2 => {
                        console.log(plaid_res2.processor_token);
                        return [plaid_res2.processor_token, customerID];
                    });
                });
            });
        })
        .then(dwolla_info => {
            return getAPIClient().then(dwolla_client => {
                const customerId = dwolla_info[1];
                const customerUrl = `${config.dwolla.url}/customers/${customerId}/funding-sources`;
                const requestBody = {
                    plaidToken: dwolla_info[0],
                    name: fundData.name
                };
                return dwolla_client.post(customerUrl, requestBody).then(dwolla_res => {
                    return [dwolla_res.headers.get('location'), customerId];
                });
            });
        })
        .then(fundInfo => {
            const fundId = fundInfo[0].substr(fundInfo[0].lastIndexOf('/') + 1);
            return ref
                .child('dwolla')
                .child('customers^funding_sources')
                .child(fundInfo[1])
                .child(fundId)
                .set({ status: 'pending' })
                .then(() => fundId);
        });
}

module.exports = linkFundingSource;
