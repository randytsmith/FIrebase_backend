const functions = require('firebase-functions');
const requestHandler = require('./common/requestHandler');
const { runJob } = require('./jobs');
const { startDwollaWebhook: startDwollaWebhookHandler, handleWebhook } = require('./dwolla/webhook');
const makeTransfer = require('./dwolla/crons/make_transfer');

exports.dwollaWebhook = functions.https.onRequest(requestHandler(handleWebhook));
exports.startDwollaWebhook = functions.https.onRequest(requestHandler(startDwollaWebhookHandler));
exports.doJob = functions.database.ref('/requests/{requestID}').onCreate(runJob);

exports.recurringTransfer = functions.https.onRequest((req, res) => {
    // run cron lazily
    makeTransfer(req.query.process_date);
    res.status(200).send('Successfully triggered');
});
