/**
 * @extends Error
 */
class ExtendableError extends Error {
    constructor(message, status, isPublic, errors) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.status = status;
        this.errors = errors;
        this.isPublic = isPublic;
        Error.captureStackTrace(this, this.constructor.name);
    }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
    /**
     * Creates an API error.
     * @param {string} message - Error message.
     * @param {number} status - HTTP status code of error.
     * @param {boolean} isPublic - Whether the message should be visible to user or not.
     * @param {Array} errors - validation errors array
     */
    constructor(message, status = 500, isPublic = false, errors) {
        super(message, status, isPublic, errors);
    }
}

module.exports = APIError;
