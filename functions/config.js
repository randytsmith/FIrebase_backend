const functions = require('firebase-functions');

const config = functions.config();

const gmailConfig = config.gmail || {};
const dwollaConfig = config.dwolla || {};
const fcmConfig = config.fcm || {};
const plaidConfig = config.plaid || {};
const sendgridConfig = config.sendgrid || {};
const rome2rioConfig = config.rome2rio || {};

module.exports = {
    plaid: {
        client_id: plaidConfig.id || '',
        secret: plaidConfig.secret || '',
        public_key: plaidConfig.secret || ''
    },
    gmail: {
        email: gmailConfig.email || '',
        password: gmailConfig.password || ''
    },
    dwolla: {
        key: dwollaConfig.key || '',
        webkey: dwollaConfig.webkey || '',
        secret: dwollaConfig.secret || '',
        environment: dwollaConfig.environment || 'sandbox',
        webhook: dwollaConfig.webhook || '',
        url: dwollaConfig.environment === 'production' ? 'https://api.dwolla.com' : 'https://api-sandbox.dwolla.com'
    },
    fcm: {
        key: fcmConfig.key || ''
    },
    sendgrid: {
        from: sendgridConfig.from || 'no-reply@tripcents.co',
        key: sendgridConfig.key || ''
    },
    rome2rio: {
        apiBase: rome2rioConfig.api_base || 'http://free.rome2rio.com/api/1.4',
        apiKey: rome2rioConfig.api_key || ''
    }
};
