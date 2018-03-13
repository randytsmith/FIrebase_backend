const sgMail = require('@sendgrid/mail');
const config = require('../config');

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

module.exports = {
    sendHTML,
    sendTemplate
};
