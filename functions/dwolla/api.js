const dwolla = require('dwolla-v2');
const config = require('../config');
const client = new dwolla.Client({
    key: config.dwolla.key,
    secret: config.dwolla.secret,
    environment: config.dwolla.environment
});

// @TODO reuse access token
export function getAPIClient() {
    return client.auth.client();
}

export default getAPIClient;
