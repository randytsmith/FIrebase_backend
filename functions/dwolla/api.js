const dwolla = require('dwolla-v2');
const moment = require('moment');
const config = require('../config');
const ref = require('../ref');
const plaid = require('plaid');

const plaidClient = new plaid.Client({
    client_id: config.plaid.client_id,
    secret: config.plaid.secret,
    public_key: config.plaid.key,
    plaidenv: plaid.environments.sandbox
});

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
