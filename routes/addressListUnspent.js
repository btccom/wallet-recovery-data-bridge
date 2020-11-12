var express = require('express');
var router = express.Router();
var esm = require('../services/electrumSocketEmitter');
var utils = require('../services/utils');
var bitcoin = require('bitcoinjs-lib');


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
            let script = bitcoin.address.toOutputScript(addr);
            let hash = bitcoin.crypto.sha256(script).reverse().toString('hex');

            pendingRequests[addr] = await esm.electrumRequest('blockchain.scripthash.listunspent', [hash]);
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
        let script = bitcoin.address.toOutputScript(address);
        let hash = bitcoin.crypto.sha256(script).reverse().toString('hex');

        let txidList = await esm.electrumRequest('blockchain.scripthash.listunspent', [hash]);
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
