const ref = require('../../ref');
const request = require('request');

/**
 * fetches and updates dwolla holding balance
 * @param {string} customerID
 * @returns {Promise<string>}
 */
function processTransfers() {
    return ref
        .child('dwolla_acces')
        .child('token')
        .once('value')
        .then(snap => snap.val())
        .then(token => {
            const options = {
                url: 'https://api-sandbox.dwolla.com/sandbox-simulations',
                headers: {
                    Accept: 'application/vnd.dwolla.v1.hal+json',
                    'Content-Type': 'application/vnd.dwolla.v1.hal+json',
                    Authorization: `Bearer ${token}`
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
