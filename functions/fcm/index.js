const FCM = require('fcm-push');
const config = require('../config');
const utils = require('../utils/user');

const fcm = new FCM(config.fcm.key);

/**
 * @param {string} deviceToken
 * @param {string} title
 * @param {string} body message body
 */
function sendNotification(deviceToken, title, body, data) {
    const message = {
        to: deviceToken,
        data: data || {},
        notification: {
            title,
            body
        }
    };

    return fcm.send(message);
}

/**
 * @param {string} userID
 * @param {string} title
 * @param {string} body message body
 */
function sendNotificationToUser(userID, title, body, data) {
    return utils.getUserInfo(userID).then(userInfo => {
        if (!userInfo) {
            throw new Error(`User not found for ${userID}`);
        }

        if (!userInfo.push_token) {
            throw new Error(`User ${userID} does not have push token`);
        }

        return sendNotification(userInfo.push_token, title, body, data);
    });
}

module.exports = {
    sendNotification,
    sendNotificationToUser
};
