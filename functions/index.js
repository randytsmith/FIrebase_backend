const functions = require('firebase-functions');
const requestHandler = require('./common/requestHandler');
const { runJob } = require('./jobs');
const { startDwollaWebhook: startDwollaWebhookHandler, handleWebhook } = require('./dwolla/webhook');

exports.dwollaWebhook = functions.https.onRequest(requestHandler(handleWebhook));
exports.startDwollaWebhook = functions.https.onRequest(requestHandler(startDwollaWebhookHandler));
exports.doJob = functions.database.ref('/requests/{requestID}').onCreate(runJob);
