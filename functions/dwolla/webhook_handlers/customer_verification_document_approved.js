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
function customerVerificationDocumentApprovedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const documentID = body.resourceId;
    const updates = {};

    updates[`dwolla/customers^documents/${customerID}/${documentID}/status`] = 'approved';
    utils.getUserID(customerID).then(userID => {
        console.log('sending email and push notification');
        // fcm.sendNotificationToUser(userID, 'Funding source verified', 'Funding source verified').catch(err => console.error(err));
        const date = new Date().toLocaleString();
        const message =
            'Congratulations, your verification document has \
        been approved! Your verification process is underway and it won’t \
        be long until you can start saving. If you need anything else, please \
        contact tripcents support through the profile screen of your app.';
        const bodyDict = {
            // test: message
        };
        mailer
            .sendTemplateToUser(userID, 'Document Approved!', '196a1c48-5617-4b25-a7bb-8af3863b5fcc', bodyDict, ' ', message)
            .catch(err => console.error(err));
    });
    return ref.update(updates);
}

module.exports = customerVerificationDocumentApprovedWebhook;
