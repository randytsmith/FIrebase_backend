const ref = require('../../ref');
const mailer = require('../../mailer');
const fcm = require('../../fcm');
const utils = require('../utils');

/**
 * handles customer_funding_source_removed event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerFundingSourceRemoveddWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const fundID = body.resourceId;
    const updates = {};

    updates[`dwolla/customers^funding_source/${customerID}/${fundID}`] = null;

    utils.getFundingSourceData(customerID, fundID).then(fundData => {
        utils.getUserID(customerID).then(userID => {
            console.log('sending email and push notification');
            fcm.sendNotificationToUser(userID, 'Funding source verified', 'Funding source verified').catch(err => console.error(err));
            const date = Date()
                .toISOstring()
                .replace(/T/, ' ')
                .replace(/\..+/, '');
            const message = `Hey! You’ve unlinked your ${fundData.bank_name} \
            account ${fundData.name} on new \
            ${date}. \
            If you'd like to set up savings or transfer saved funds, please \
            reconnect your account within the app. For support please contact \
            tripcents support through the “profile” screen of your app`;
            const bodyDict = {
                body: message
            };
            mailer
                .sendTemplateToUser(
                    userID,
                    'Funding Source Removed!',
                    '63fc288b-b692-4d2f-a49a-2e8e7ae08263',
                    bodyDict,
                    'funding source removed',
                    'funding source removed'
                )
                .catch(err => console.error(err));
        });

        return ref.update(updates);
    });
}

module.exports = customerFundingSourceRemoveddWebhook;
