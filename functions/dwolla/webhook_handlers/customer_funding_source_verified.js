const ref = require('../../ref');
const mailer = require('../../mailer');
const fcm = require('../../fcm');
const utils = require('../utils');

/**
 * handles customer_funding_source_verified event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerFundingSourceVerifiedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const fundID = body.resourceId;
    const updates = {};

    updates[`dwolla/customers^funding_source/${customerID}/${fundID}/status`] = 'verified';
    utils.getFundingSourceData(customerID, fundID).then(fundData => {
        utils.getUserID(customerID).then(userID => {
            console.log('sending email and push notification');
            fcm.sendNotificationToUser(userID, 'Funding source verified', 'Funding source verified').catch(err => console.error(err));
            const message = `Thanks for connecting your bank account! Your ${fundData.bank_name} \
            account ${fundData.name} has been verified on \
            ${Date()
                .toISOstring()
                .replace(/T/, ' ')
                .replace(/\..+/, '')}. \
            For support please contact tripcents support \
            through the “profile” screen of your app`;
            const bodyDict = {
                body: message
            };
            mailer
                .sendTemplateToUser(
                    userID,
                    'Funding Source Verified!',
                    '63fc288b-b692-4d2f-a49a-2e8e7ae08263',
                    bodyDict,
                    'funding source verified',
                    'funding source verified'
                )
                .catch(err => console.error(err));
        });

        return ref.update(updates);
    });
}

module.exports = customerFundingSourceVerifiedWebhook;
