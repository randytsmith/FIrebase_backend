// @TODO use sendgrid instead of gmail
// @TODO finish sendmail
const nodemailer = require('nodemailer');
const config = require('../config');

const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.gmail.email,
        pass: config.gmail.password
    }
});

function sendMail(email, topic){
}

export default sendMail;
