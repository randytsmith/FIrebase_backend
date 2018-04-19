const ref = require('../../ref');
const mailer = require('../../mailer');
// const fcm = require('../../fcm');
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
    return utils.getFundingSourceData(customerID, fundID).then(fundData => {
        utils.getUserID(customerID).then(userID => {
            console.log('sending email and push notification');
            // fcm.sendNotificationToUser(userID, 'Funding source verified', 'Funding source verified').catch(err => console.error(err));
            const date = new Date().toLocaleString();
            const message = `Here's a friendly confirmation email! You’ve unlinked your ${fundData.bank_name} \
            account ${fundData.name} on new \
            ${date}. \
            If you'd like to set up savings or transfer saved funds, please \
            reconnect or link another bank account within the app. For support please contact \
            tripcents support through the “profile” screen of your app.`;
            console.log('declared message');
            const bodyDict = {};
            mailer
                .sendTemplateToUser(userID, 'Funding Source Removed!', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', bodyDict, ' ', message)
                .catch(err => console.error(err));
        });
        return ref.update(updates);
    });
}

module.exports = customerFundingSourceRemoveddWebhook;
