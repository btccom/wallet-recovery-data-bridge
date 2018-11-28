var express = require('express');
var router = express.Router();
var esm = require('../services/electrumSocketEmitter');
var utils = require('../services/utils');

router.post('/', async function (req, res, next) {
    let address = req.body.address ? req.body.address : "";
    if (!address) {
        res.send(false);
        return;
    }
    res.setHeader('Content-Type', 'application/json');
    let results = [];

    if (Array.isArray(address)) {
        address = utils.uniq(address);
        let pendingRequests = [];
        address.forEach(function (addr) {
            let pending = esm.electrumRequest('blockchain.address.listunspent', [addr]);
            pendingRequests.push(pending);
        });

        await Promise.all(pendingRequests)
            .then(function (resultsRequests) {
                resultsRequests.forEach(function (request) {
                    let requestObj = JSON.parse(request);
                    if (requestObj.result) results = results.concat(requestObj.result);
                });
            }).catch(function (ex) {
                console.error(ex);
            }); // gotta have that concurrency
    } else {
        let txidList = await esm.electrumRequest('blockchain.address.listunspent', [address]);
        let txidSet = JSON.parse(txidList);
        if (txidSet.result) results = txidSet.result;
    }

    if (results) {
        res.send(results);
    } else {
        res.send(false);
    }
});

module.exports = router;
