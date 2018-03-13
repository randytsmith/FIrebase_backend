const ref = require('../ref');

function getUserInfo(userID) {
    return ref
        .child('all_users')
        .child(userID)
        .once('value')
        .then(snap => snap.val());
}

module.exports = {
    getUserInfo
};
