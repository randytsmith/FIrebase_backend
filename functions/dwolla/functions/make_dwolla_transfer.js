const ref = require('../../ref');
const getAPIClient = require('../api');

// @TODO define customerData granually
/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} transferData
 * @returns {Promise<string>} promise of customerID added
 */
function makeDwollaTransfer(userID, transferData) {
    var custID = ''
    return getAPIClient()
        .then(client => {
          /** want to
          1. using uid get dwolla id
          2. using dwolla id get dwolla holding id
          Going to send the dwolla id in the request but would still be good
          to know

          **/
            const requestBody = {
              _links: {
                source: {
                  href: `https://api-sandbox.dwolla.com/funding-sources/${transferData[fund]}`
                },
                destination: {
                  href: `https://api-sandbox.dwolla.com/funding-sources/${transferData[holding]}`
                }
              },
              amount: {
                currency: 'USD',
                value: `${transferData[amount]}`
              },
              clearing: {
                destination: 'next-available',
                source: 'standard'
              }
            };
            return client.post('transfers', requestBody)
            .then(res => {
              const transferUrl = res.headers.get('location');
              return transferUrl.substr(transferUrl.lastIndexOf('/') + 1)
            })
        })
        .then(transfer => {
            return Promise.all([
                ref
                    .child('dwolla')
                    .child('transfers')
                    .child(customerID)
                    .set(newCustomer),
                ref
                    .child('dwolla')
                    .child('users^customers')
                    .child(userID)
                    .set(customerID)
            ]).then(() => customerID);
        });
}

module.exports = makeDwollaTransfer;
