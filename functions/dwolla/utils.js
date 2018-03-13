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

function getBankTransfer(customerID, transferID) {
    return ref
        .child('dwolla')
        .child('customers^bank_transfers')
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

function getCustomerID(userID) {
    return ref
        .child('dwolla')
        .child('users^customers')
        .child(userID)
        .once('value')
        .then(snap => snap.val());
}

function getUserID(customerID) {
    return ref
        .child('dwolla')
        .child('customers^users')
        .child(customerID)
        .once('value')
        .then(snap => snap.val());
}

function getRecurringTransferProcessDate(customerID) {
    return ref
        .child('dwolla')
        .child('customers^recurring_transfers')
        .child(customerID)
        .once('value')
        .then(snap => snap.val());
}

function getRecurringTransferData(customerID, processDate) {
    return ref
        .child('dwolla')
        .child('recurring_transfers^customers')
        .child(processDate)
        .child(customerID)
        .once('value')
        .then(snap => snap.val());
}

function getCustomerHoldingID(customerID) {
    return ref
        .child('dwolla')
        .child('customers^dwolla_holdings')
        .child(customerID)
        .once('value')
        .then(snap => snap.val());
}

module.exports = {
    getTransfer,
    getBankTransfer,
    getCustomer,
    getCustomerID,
    getUserID,
    getRecurringTransferProcessDate,
    getRecurringTransferData,
    getCustomerHoldingID
};
