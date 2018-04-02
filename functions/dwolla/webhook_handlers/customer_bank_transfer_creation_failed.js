const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerHoldingID, getUserID } = require('../utils');
const crypto = require('crypto');
const fcm = require('../../fcm');
const utils = require('../utils');
const mailer = require('../../mailer');

/**
 * handles customer_bank_transfer_creation_failed event from dwolla
 * @param {string} body.resourceId transfer ID
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCreationFailedWebhook(body) {
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
                    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'creation_failed';
                    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/created_at`] = -new Date().valueOf();
                    updates[`dwolla/customers/${customerID}/balance`] = bal;
                    return utils.getBankTransfer(customerID, transferID).then(transfer => {
                        console.log('sending email and push notification');
                        fcm.sendNotificationToUser(userID, 'transfer created failed', 'transfer creation failed').catch(err => console.error(err));
                        const date = Date()
                            .toISOstring()
                            .replace(/T/, ' ')
                            .replace(/\..+/, '');
                        const message = [];
                        if (transfer.type === 'deposit') {
                            message[0] = `Oh no! A  transfer for ${transfer.amount} \
                            has failed on ${date} from ${transfer.bank_name} to your Travel Savings.  For \
                            support please contact tripcents support through the
                            “profile” screen of your app.`;
                        } else {
                            message[0] = `Oh no! A  transfer for ${transfer.amount} \
                            has failed on ${date} from Travel Savings to ${transfer.bank_name}.  For \
                            support please contact tripcents support through the
                            “profile” screen of your app.`;
                        }
                        const bodyDict = {
                            body: message
                        };
                        mailer
                            .sendTemplateToUser(
                                userID,
                                'Transfer creation failed',
                                '196a1c48-5617-4b25-a7bb-8af3863b5fcc',
                                bodyDict,
                                'transfer creation failed',
                                'transfer creation failed'
                            )
                            .catch(err => console.error(err));

                        return ref.update(updates);
                    });
                });
            });
        });
    });
}

module.exports = customerBankTransferCreationFailedWebhook;
