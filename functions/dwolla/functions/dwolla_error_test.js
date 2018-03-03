const APIError = require('../../common/ApiError');

function test() {
    return Promise.reject(new APIError(403, 'Error error test!'));
}

module.exports = test;
