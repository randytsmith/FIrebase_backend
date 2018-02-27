const customer_created = require('./customer_created');
const customer_verified = require('./customer_verified');
const customer_suspended = require('./customer_suspended');
const customer_reverification_needed = require('./customer_reverification_needed');

export default {
    customer_created,
    customer_suspended,
    customer_verified,
    customer_reverification_needed
};
