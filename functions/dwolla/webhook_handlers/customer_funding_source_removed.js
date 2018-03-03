const ref = require('../../ref');

/**
 * handles customer_funding_source_removed event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
function customerFundingSourceRemoveddWebhook(body) {
    const custUrl = body._links.customer.href;
    const customerID = custUrl.substr(custUrl.lastIndexOf('/') + 1);
    const fund = body.resourceId;
    const updates = {};

    updates[`dwolla_customer/${customerID}`] = {
        dwolla_fund: fund
    };
    return ref.update(updates);
}

module.exports = customerFundingSourceRemoveddWebhook;
