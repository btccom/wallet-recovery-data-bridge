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
        let pendingRequests = {};

        await utils.asyncForEach(address, async function (addr) {
            pendingRequests[addr] = await esm.electrumRequest('blockchain.address.listunspent', [addr]);
        });

        for (let addr in pendingRequests) {
            if (pendingRequests.hasOwnProperty(addr)) {
                let resultRequest = pendingRequests[addr];
                let requestObj = JSON.parse(resultRequest);

                if (requestObj.result) {
                    requestObj.result.forEach(function (reqObjEntry) {
                        reqObjEntry["address"] = addr;
                        // TODO: regenerate scriptPubKey - maybe not here though
                    });
                    results = results.concat(requestObj.result)
                }
            }
        }
    } else {
        let txidList = await esm.electrumRequest('blockchain.address.listunspent', [address]);
        let txidSet = JSON.parse(txidList);
        if (txidSet.result) {
            txidSet.result.forEach(function (reqObjEntry) {
                reqObjEntry["address"] = address;
            });
            results = txidSet.result;
        }
    }

    if (results) {
        res.send(results);
    } else {
        res.status(400);
        res.send(false);
    }
});

module.exports = router;
