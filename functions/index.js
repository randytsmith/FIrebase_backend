const functions = require('firebase-functions');
const requestHandler = require('./common/requestHandler');
const { runJob } = require('./jobs');

const {
    startDwollaWebhook: startDwollaWebhookHandler,
    listDwollaWebhooks: listDwollaWebhooksHandler,
    removeDwollaWebhook: removeDwollaWebhookHandler,
    handleWebhook
} = require('./dwolla/webhook');
const makeTransfer = require('./dwolla/crons/make_transfer');
const updateBalance = require('./dwolla/crons/update_holding_bal');
const processTransfers = require('./dwolla/crons/process_transfers');
const roundUp = require('./dwolla/crons/round_up');

exports.dwollaWebhook = functions.https.onRequest(requestHandler(handleWebhook));
exports.startDwollaWebhook = functions.https.onRequest(requestHandler(startDwollaWebhookHandler));
exports.listDwollaWebhooks = functions.https.onRequest(requestHandler(listDwollaWebhooksHandler));
exports.removeDwollaWebhook = functions.https.onRequest(requestHandler(removeDwollaWebhookHandler));
exports.doJob = functions.database.ref('/requests/{requestID}').onCreate(runJob);

exports.autoProcessTransfers = functions.https.onRequest((req, res) => {
    processTransfers();
    res.status(200).send('Successfully triggered');
});

exports.recurringTransfer = functions.https.onRequest((req, res) => {
    // run cron lazily
    makeTransfer(req.query.process_date);
    res.status(200).send('Successfully triggered');
});

exports.updateHoldingBalance = functions.https.onRequest((req, res) => {
    updateBalance();
    res.status(200).send('Successfully triggered');
});

exports.roundUp = functions.https.onRequest((req, res) => {
    roundUp(req.query.recurring_plan);
    res.status(200).send(`Successfully triggered roundup for ${req.query.recurring_plan}`);
});
