const ref = require('../../ref');
const { getCustomerHoldingID, getUserID } = require('../utils');
const config = require('../../config');
const { getAPIClient } = require('../api');
const crypto = require('crypto');
const mailer = require('../../mailer');
const fcm = require('../../fcm');
const utils = require('../utils');

/**
 * handles customer_bank_transfer_completed event from dwolla
 * @param {string} body.resourceId transfer ID
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCompletedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const transferID = body.resourceId;
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
                    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'completed';
                    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/updated_at`] = -new Date().valueOf();
                    updates[`dwolla/customers/${customerID}/balance`] = bal;
                    return utils.getBankTransfer(customerID, transferID).then(transfer => {
                        console.log('sending email and push notification');
                        fcm.sendNotificationToUser(userID, 'Transfer completed', 'transfer completed').catch(err => console.error(err));
                        const date = Date()
                            .toISOstring()
                            .replace(/T/, ' ')
                            .replace(/\..+/, '');
                        const message = [];
                        if (transfer.type === 'deposit') {
                            message[0] = `“Hooray! A transfer for ${transfer.amount} \
                            was completed on ${date} from ${transfer.bank_name} to Travel Savings. \
                            For support please contact tripcents support through \
                            the “profile” screen of your app.`;
                        } else {
                            message[0] = `“Hooray! A transfer for ${transfer.amount} \
                            was completed on ${date} from Travel Savings to ${transfer.bank_name}. \
                            For support please contact tripcents support through \
                            the “profile” screen of your app.`;
                        }
                        const bodyDict = {
                            body: message[0]
                        };
                        mailer
                            .sendTemplateToUser(
                                userID,
                                'Transfer completed',
                                '63fc288b-b692-4d2f-a49a-2e8e7ae08263',
                                bodyDict,
                                'transfer completed',
                                'transfer completed'
                            )
                            .catch(err => console.error(err));

                        return ref.update(updates);
                    });
                });
            });
        });
    });
}

module.exports = customerBankTransferCompletedWebhook;

/**
return Promise.all([getCustomer(customerID), getBankTransfer(customerID, transferID)]).then(resp => {
    const customer = resp[0];
    const transfer = resp[1];

    if (!transfer) {
        return Promise.reject(new APIError(`Transfer ${transferID} not found`, 404));
    }

    if (!customer) {
        return Promise.reject(new APIError(`Customer ${customerID} not found`, 404));
    }
    const updates = {};

    let amount = transfer.amount * 1;
    if (transfer.type === 'withdraw') {
        amount *= -1;
    }
    */
