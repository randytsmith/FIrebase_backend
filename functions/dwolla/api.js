const dwolla = require('dwolla-v2');
const moment = require('moment');
const config = require('../config');
const ref = require('../ref');
const plaid = require('plaid');

const client = new dwolla.Client({
    key: config.dwolla.key,
    secret: config.dwolla.secret,
    environment: config.dwolla.environment
});

function updateToken() {
    return client.auth.client().then(token => {
        const updates = {
            dwolla_access: {
                token: token.access_token,
                timestamp: new Date().valueOf()
            }
        };
        return ref.update(updates).then(() => token);
    });
}

function getPlaidClient() {
    // const plaidClient = new plaid.Client(config.plaid.id, config.plaid.secret, config.plaid.key, 'plaid.development.sandbox');
    const plaidClient = new plaid.Client(
        '5a426772efe64e7803074efe',
        'ea58ff5c626d54dc5b473c633899a7',
        '19af20e429a5573d9336a7da329f03',
        'plaid.development.sandbox'
    );
    return plaidClient;
}

function getAPIClient() {
    return ref
        .child('dwolla_access')
        .once('value')
        .then(snap => snap.val())
        .then(dwollaAccess => {
            if (!dwollaAccess) return updateToken();

            const lastFetchTime = moment(dwollaAccess.timestamp, 'x');
            const timeDiff = moment().diff(lastFetchTime, 'seconds');
            if (timeDiff >= 3600) {
                return updateToken();
            }

            return new client.Token({
                access_token: dwollaAccess.token,
                expires_in: timeDiff
            });
        });
}

module.exports = {
    getAPIClient,
    getPlaidClient
};
