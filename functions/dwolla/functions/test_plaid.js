const { getPlaidClient } = require('../api');

/**
 * handles customer_activated event from dwolla
 * @param {string} userID
 * @param {Object} fundData
 * @returns {Promise<string>} promise of customerID added
 */
function testPlaid(userID, fundData) {
    return getPlaidClient().then(client => {
        return client.createPublicToken('testvalue').then(() => fundData);
    });
}

module.exports = testPlaid;
