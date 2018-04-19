const ref = require('../../ref');
// const mailer = require('../../mailer');
// // const fcm = require('../../fcm');
// const utils = require('../utils');

/**
 * handles customer_funding_source_added event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
// customer fund is being added as verified because in the sandbox
// the verification webhooks sometimes come before created
function customerFundingSourceAddedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const fundID = body.resourceId;
    const updates = {};

    updates[`dwolla/customers^funding_source/${customerID}/${fundID}/status`] = 'verified';

    // utils.getFundingSourceData(customerID, fundID).then(fundData => {
    //     utils.getUserID(customerID).then(userID => {
    //         console.log('sending email and push notification');
    //         // fcm.sendNotificationToUser(userID, 'Funding Source Added', 'Funding Source Added').catch(err => console.error(err));
    //         const date = new Date().toLocaleString();
    //         const message = `Now this is a serious cause for celebration! You’ve linked your ${fundData.bank_name} \
    //         account ${fundData.name} on new \
    //         ${date}. \
    //         You may have 99 problems, but saving for a trip ain’t one! For support please contact tripcents support \
    //         through the “profile” screen of your app.`;
    //         const bodyDict = {
    //             test: message
    //         };
    //         mailer
    //             .sendTemplateToUser(userID, 'Funding Source Added!', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', bodyDict, ' ', ' ')
    //             .catch(err => console.error(err));
    //     });
    // });
    return ref.update(updates);
}

module.exports = customerFundingSourceAddedWebhook;
