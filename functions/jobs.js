const APIError = require('./common/ApiError');
const ref = require('./ref');
const dwollaJobs = require('./dwolla/functions');

const jobs = {
    success_test: dwollaJobs.dwolla_success_test,
    error_test: dwollaJobs.dwolla_error_test,
    add_dwolla_customer: dwollaJobs.add_dwolla_customer,
    add_recurring_transfer: dwollaJobs.add_recurring_transfer,
    link_funding_source: dwollaJobs.link_funding_source,
    make_dwolla_transfer: dwollaJobs.remove_funding_source
};

function respondSuccess(key, result) {
    console.log(result);
    return ref.child(`responses/${key}`).set({
        status: 'ok',
        result: result || null
    });
}

function respondError(key, error) {
    console.error(error);
    return ref.child(`responses/${key}`).set({
        status: 'failure',
        code: error.status || null,
        message: error.message || 'Unknown error'
    });
}

function runJob(event) {
    const request = event.data.val();
    const key = event.params.requestID;
    const name = request.name;
    console.log(`Got request(${key}): ${name}`);
    console.log('Parameters: ', request.parameters);
    console.log(jobs)

    if (!jobs[name]) {
        return respondError(key, new APIError(`${name} job not found`, 404));
    }

    return jobs[name](request.uid, request.parameters)
        .then(result => respondSuccess(key, result))
        .catch(error => respondError(key, error));
}

module.exports = {
    respondSuccess,
    respondError,
    runJob
};
