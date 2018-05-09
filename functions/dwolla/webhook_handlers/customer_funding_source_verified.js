const ref = require('../../ref');
const mailer = require('../../mailer');
// const fcm = require('../../fcm');
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
            // fcm.sendNotificationToUser(userID, 'Funding source verified', 'Funding source verified').catch(err => console.error(err));
            const date = new Date().toLocaleString();
            const message = `Thanks for connecting your bank account! Good news, it’s verified \
            and ready for some saving action. Your ${fundData.bank_name} \
            account ${fundData.name} has been verified on \
            ${utils.getHumanTime(date)}. \
            For support please contact tripcents support \
            through the “profile” screen of your app.`;
            const bodyDict = {
                // test: message
            };
            mailer
                .sendTemplateToUser(userID, 'Funding Source Verified!', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', bodyDict, ' ', message)
                .catch(err => console.error(err));
        });
    });
    return ref.update(updates);
}

module.exports = customerFundingSourceVerifiedWebhook;
