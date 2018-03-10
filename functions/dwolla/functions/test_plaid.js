const ref = require('../../ref');
const { getPlaidClient } = require('../api');

/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} fundData
 * @returns {Promise<string>} promise of customerID added
 */
function testPlaid(userID, fundData) {
    return getPlaidClient().then(fundInfo => {
        const fundId = fundInfo[0].substr(fundInfo[0].lastIndexOf('/') + 1);
        console.log(fundData);
        return ref
            .child('dwolla')
            .child('customers^funding_sources')
            .child(fundInfo[1])
            .child(fundId)
            .set({ status: 'pending' })
            .then(() => fundId);
    });
}

module.exports = testPlaid;
