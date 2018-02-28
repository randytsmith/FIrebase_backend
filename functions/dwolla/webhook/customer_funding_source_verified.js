const ref = require('../../ref');

/**
 * handles customer_funding_source_verified event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
export default function customerFundingSourceVerifiedWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const fund = body.resourceId;
    const updates = {};

    updates[`dwolla_fund_source/${fund}`] = {
        status: 'verified'
    };
    return ref.update(updates);
}
