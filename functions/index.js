const functions = require('firebase-functions');
const requestHandler = require('./common/requestHandler');
const { startDwollaWebhook: startDwollaWebhookHandler, handleWebhook } = require('./dwolla/webhook');

export const dwollaWebhook = functions.https.onRequest(requestHandler(handleWebhook));
export const startDwollaWebhook = functions.https.onRequest(requestHandler(startDwollaWebhookHandler));
