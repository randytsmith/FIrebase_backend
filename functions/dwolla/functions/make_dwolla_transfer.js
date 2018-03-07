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
    return getAPIClient()
        .then(client => {
            return ref
                .child('dwolla')
                .child('users^customers')
                .child(userID)
                .once('value')
                .then(snap => snap.val())
                .then(dwollaId => {
                    return ref
                        .child('dwolla')
                        .child('customers^dwolla_holding')
                        .child(dwollaId)
                        .once('value')
                        .then(snap2 => snap2.val())
                        .then(holdingID => {
                            return [dwollaId, holdingID];
                        });
                })
                .then(IDs => {
                    const requestBody = {
                        _links: {
                            source: {
                                href: `https://api-sandbox.dwolla.com/funding-sources/${transferData.fund}`
                            },
                            destination: {
                                href: `https://api-sandbox.dwolla.com/funding-sources/${IDs[1]}`
                            }
                        },
                        amount: {
                            currency: 'USD',
                            value: transferData.amount
                        },
                        clearing: {
                            destination: 'next-available',
                            source: 'standard'
                        }
                    };
                    return client.post('transfers', requestBody).then(res => {
                        const transferUrl = res.headers.get('location');
                        const transferId = transferUrl.substr(transferUrl.lastIndexOf('/') + 1);
                        return transferId;
                    });
                });
        })
        .then(transfer => {
            return ref
                .child('dwolla')
                .child('customers^transfers')
                .child(transfer.dwollaId)
                .child(transfer.transferId)
                .set({ amount: transferData.amount, status: 'pending' })
                .then(() => transfer.transferId);
        });
}

module.exports = makeDwollaTransfer;
