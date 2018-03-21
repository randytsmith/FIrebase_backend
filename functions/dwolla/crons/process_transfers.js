const request = require('request-promise');
const { getAPIClient } = require('../api');

/**
 * fetches and updates dwolla holding balance
 * @param {string} customerID
 * @returns {Promise<string>}
 */
function processTransfers() {
    return getAPIClient().then(token => {
        const options = {
            method: 'POST',
            url: 'https://api-sandbox.dwolla.com/sandbox-simulations',
            headers: {
                Accept: 'application/vnd.dwolla.v1.hal+json',
                'Content-Type': 'application/vnd.dwolla.v1.hal+json',
                Authorization: `Bearer ${token.access_token}`
            }
        };
        request(options)
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
    });
}

module.exports = processTransfers;
