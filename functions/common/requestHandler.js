/**
 * generates common result for API
 * @param {(req, res) => Promise} handler
 * @returns {Promise}
 */
function requestHandler(handler) {
    return (req, res) => {
        return handler(req, res)
            .then(result => {
                res.status(200).send(result || 'OK');
            })
            .catch(error => {
                res.status(error.status || 500).send({
                    message: error.message,
                    errors: error.errors
                });
            });
    };
}

module.exports = requestHandler;
