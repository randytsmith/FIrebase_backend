const sgMail = require('@sendgrid/mail');
const config = require('../config');
const utils = require('../utils/user');

sgMail.setApiKey(config.sendgrid.key);

/**
 * @param {Array<string>} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html html can be duplicate of text
 */
function sendHTML(to, subject, text, html) {
    const msg = {
        to,
        from: config.sendgrid.from,
        subject,
        text,
        html: html || text
    };
    return sgMail.send(msg);
}

/**
 * @param {Array<string>} to
 * @param {string} subject
 * @param {string} templateId
 * @param {Object} emailVars
 * @param {string} text
 * @param {string} html html can be duplicate of text
 */
function sendTemplate(to, subject, templateId, emailVars, text, html) {
    const msg = {
        to,
        from: config.sendgrid.from,
        subject,
        text: text || '',
        html: html || text || '',
        templateId,
        substitutions: emailVars
    };
    return sgMail.send(msg);
}

/**
 * @param {string} userID
 * @param {string} subject
 * @param {string} text
 * @param {string} html html can be duplicate of text
 */
function sendHTMLToUser(userID, subject, text, html) {
    return utils.getUserInfo(userID).then(userInfo => {
        if (!userInfo) {
            throw new Error(`User not found for ${userID}`);
        }

        if (!userInfo.email) {
            throw new Error(`User ${userID} does not have push token`);
        }

        return sendHTML([userInfo.email], subject, text, html);
    });
}

/**
 * @param {string} userID
 * @param {string} subject
 * @param {string} templateId
 * @param {Object} emailVars
 * @param {string} text
 * @param {string} html html can be duplicate of text
 */
function sendTemplateToUser(userID, subject, templateId, emailVars, text, html) {
    return utils.getUserInfo(userID).then(userInfo => {
        if (!userInfo) {
            throw new Error(`User not found for ${userID}`);
        }

        if (!userInfo.email) {
            throw new Error(`User ${userID} does not have push token`);
        }

        return sendTemplate([userInfo.email], subject, templateId, emailVars, text, html);
    });
}

module.exports = {
    sendHTML,
    sendTemplate,
    sendHTMLToUser,
    sendTemplateToUser
};
