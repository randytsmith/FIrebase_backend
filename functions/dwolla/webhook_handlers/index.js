const customer_created = require('./customer_created');
const customer_verified = require('./customer_verified');
const customer_suspended = require('./customer_suspended');
const customer_reverification_needed = require('./customer_reverification_needed');
const customer_deactivated = require('./customer_deactivated');
const customer_activated = require('./customer_activated');
const customer_bank_transfer_failed = require('./customer_bank_transfer_failed');
const customer_bank_transfer_created = require('./customer_bank_transfer_created');
const customer_bank_transfer_cancelled = require('./customer_bank_transfer_cancelled');
const customer_bank_transfer_completed = require('./customer_bank_transfer_completed');
const customer_bank_transfer_creation_failed = require('./customer_bank_transfer_creation_failed');
const customer_funding_source_verified = require('./customer_funding_source_verified');
const customer_funding_source_added = require('./customer_funding_source_added');
const customer_funding_source_removed = require('./customer_funding_source_removed');
const customer_transfer_cancelled = require('./customer_transfer_cancelled');
const customer_transfer_created = require('./customer_transfer_created');
const customer_transfer_failed = require('./customer_transfer_failed');
const customer_transfer_completed = require('./customer_transfer_completed');

module.exports = {
    customer_created,
    customer_suspended,
    customer_verified,
    customer_reverification_needed,
    customer_deactivated,
    customer_activated,
    customer_bank_transfer_failed,
    customer_bank_transfer_created,
    customer_bank_transfer_cancelled,
    customer_bank_transfer_completed,
    customer_bank_transfer_creation_failed,
    customer_funding_source_verified,
    customer_funding_source_added,
    customer_funding_source_removed,
    customer_transfer_cancelled,
    customer_transfer_created,
    customer_transfer_failed,
    customer_transfer_completed
};
