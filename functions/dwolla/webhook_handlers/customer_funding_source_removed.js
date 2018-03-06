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
    const fundID = body.resourceId;
    const updates = {};

    updates[`dwolla/customers^funding_source/${customerID}/${fundID}`] = null;
    return ref.update(updates);
}

module.exports = customerFundingSourceRemoveddWebhook;
