const ref = require('../../ref');
const { getAPIClient } = require('../api');
/**
 * handles customer_verified event from dwolla
 * @param {string} body.resourceId
 * @param {string} _links.resource.href customer resource url
 * @returns {Promise}
 */
export default function customerVerifiedWebhook(body) {
    const customerID = body.resourceId;
    const customerURL = body._links.resource.href;

    return getAPIClient()
        .then(client => client.get(customerURL + '/funding-sources'))
        .then(res => {
            const updates = {};
            const balanceID = res.body._embedded['funding-sources'][0].id;
            updates['dwolla_customer/' + customerID] = {
                status: 'verified',
                dwolla_bal: balanceID
            };
            return ref.update(updates);
        });
}
