const crypto = require('crypto');
const APIError = require('../common/ApiError');
const config = require('../config');
const getAPIClient = require('./api');
const ref = require('../ref');
const webhookHandlers = require('./webhook_handlers');

/**
 * subscribes to dwolla webhook and start listening for it
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise}
 */
function startDwollaWebhook() {
    return getAPIClient().then(client => {
        const params = {
            url: config.dwolla.webhook,
            secret: config.dwolla.webkey
        };

        return client.post('webhook-subscriptions', params).then(response => {
            const location = response.headers.get('location');
            return ref
                .child('dwolla')
                .child('webhook')
                .set(location);
        });
    });
}

/**
 * subscribes to dwolla webhook and start listening for it
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise}
 */
function handleWebhook(req) {
    const signature = req.get('X-Request-Signature-Sha-256');
    const hmac = crypto
        .createHmac('sha256', config.dwolla.webkey)
        .update(req.rawBody)
        .digest('hex');

    if (hmac === signature) {
        const topic = req.body.topic;
        if (!webhookHandlers[topic]) {
            // @TODO use pretty-log
            // silently end because error will mark webhook unsubscribed
            console.error('Webhook handler not found');
            return Promise.resolve();
        }

        return webhookHandlers[topic](req.body);
    }
    return Promise.reject(new APIError('Signature did not match', 401));
}

module.exports = {
    startDwollaWebhook,
    handleWebhook
};
