const ref = require('../ref');

function getTransfer(customerID, transferID) {
    return ref
        .child('dwolla')
        .child('customers^transfers')
        .child(customerID)
        .child(transferID)
        .once('value')
        .then(snap => snap.val());
}

function getCustomer(customerID) {
    return ref
        .child('dwolla')
        .child('customers')
        .child(customerID)
        .once('value')
        .then(snap => snap.val());
}

module.exports = {
    getTransfer,
    getCustomer
};
