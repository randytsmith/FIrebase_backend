const ref = require('../../ref');
const { getAPIClient } = require('../api');
const config = require('../../config');
const { getCustomerHoldingID, getUserID } = require('../utils');
const crypto = require('crypto');
const mailer = require('../../mailer');
const fcm = require('../../fcm');
const utils = require('../utils');
/**
 * handles customer_bank_transfer_created event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerBankTransferCreatedWebhook(body) {
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
                    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/status`] = 'created';
                    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/created_at`] = -new Date().valueOf();
                    updates[`dwolla/customers^bank_transfers/${customerID}/${transferID}/updated_at`] = -new Date().valueOf();
                    updates[`dwolla/customers/${customerID}/balance`] = bal;
                    utils.getBankTransfer(customerID, transferID).then(transfer => {
                        console.log('sending email and push notification');

                        const date = transfer.created_at;
                        const src = [];
                        const dest = [];
                        let message = '';
                        if (transfer.type === 'withdraw') {
                            src[0] = 'your Travel Fund';
                            dest[0] = transfer.bank_name;
                            message = `Thought you'd want to know - A withdrawal for $${transfer.amount} \
                            was initiated on ${utils.getHumanTime(date)} from your ${src[0]} to ${dest[0]}. Withdrawals \
                            initiated before 5PM EST on business days (excluding bank holidays) \
                            will typically post within 1-3 business days. For help please contact \
                            tripcents support through the “profile” screen of your app.`;
                        } else {
                            src[0] = transfer.bank_name;
                            dest[0] = 'your Travel Fund';
                            message = `Just keeping you in the loop - A transfer for $${transfer.amount} was initated \
                                on ${utils.getHumanTime(date)} from ${src[0]} to ${dest[0]}. A few more transfers and you’ll be choosing your \
                                seats for your flight to paradise (hopefully it’s not a middle seat). For \
                                support please contact tripcents support through the “profile” screen of your app.`;
                        }
                        const bodyDict = {};
                        mailer
                            .sendTemplateToUser(userID, 'Transfer created', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', bodyDict, ' ', message)
                            .catch(err => console.error(err));
                        fcm.sendNotificationToUser(userID, 'Transfer created', message)
                          .catch(err => console.error(err));
                    });
                    return ref.update(updates);
                });
            });
        });
    });
}

module.exports = customerBankTransferCreatedWebhook;
