const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerHoldingID, getUserID } = require('../utils');
const crypto = require('crypto');
const mailer = require('../../mailer');
const fcm = require('../../fcm');
const utils = require('../utils');

/**
 * handles customer_bank_transfer_cancelled event from dwolla
 * @param {string} body.resourceId transfer ID
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCancelledWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transferID = body.resourceId;
    const message = [];
    return getAPIClient().then(client => {
        return getCustomerHoldingID(customerID).then(holdingID => {
            if (!holdingID) {
                throw new Error(`No dwolla holding account for ${customerID}'`);
            }
            return client.get(`${config.dwolla.url}/funding-sources/${holdingID}/balance`).then(res => {
                return getUserID(customerID).then(userID => {
                    const bal = res.body.balance.value;
                    const updates = {};
                    const key = crypto.randomBytes(10).toString('hex');
                    updates[`dwolla/users^bank_transfers/${userID}`] = key;
                    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'cancelled';
                    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/updated_at`] = -new Date().valueOf();
                    updates[`dwolla/customers/${customerID}/balance`] = bal;
                    return utils.getBankTransfer(customerID, transferID).then(transfer => {
                        console.log('sending email and push notification');
                        fcm.sendNotificationToUser(userID, 'Transfer cancelled', 'transfer cancelled').catch(err => console.error(err));
                        const date = Date()
                            .toISOstring()
                            .replace(/T/, ' ')
                            .replace(/\..+/, '');
                        if (transfer.type === 'deposit') {
                            message[0] = `A transfer for ${transfer.amount} was cancelled \
                            on ${date} from ${transfer.bank_name} to Travel Savings. For support please \
                            contact tripcents support through the “profile” screen of \
                            your app.`;
                        } else {
                            message[0] = `A transfer for ${transfer.amount} was cancelled \
                            on ${date} from Travel Savings to ${transfer.bank_name}. For support please \
                            contact tripcents support through the “profile” screen of \
                            your app.`;
                        }
                        const bodyDict = {
                            body: message[0]
                        };
                        mailer
                            .sendTemplateToUser(
                                userID,
                                'Transfer Cancelled',
                                '63fc288b-b692-4d2f-a49a-2e8e7ae08263',
                                bodyDict,
                                'transfer cancelled',
                                'transfer cancelled'
                            )
                            .catch(err => console.error(err));

                        return ref.update(updates);
                    });
                });
            });
        });
    });
}

module.exports = customerBankTransferCancelledWebhook;
