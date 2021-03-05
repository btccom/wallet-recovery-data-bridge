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
        let resultsRequests = [];

        await utils.asyncForEach(address, async function (addr) {
            let script = bitcoin.address.toOutputScript(addr);
            let hash = bitcoin.crypto.sha256(script).reverse().toString('hex');

            let pending = await esm.electrumRequest('blockchain.scripthash.get_history', [hash]);
            resultsRequests.push(pending);
        });

        resultsRequests.forEach(function (request) {
            let requestObj = JSON.parse(request);
            if (requestObj.result) results = results.concat(requestObj.result);
        });

    } else {
        let script = bitcoin.address.toOutputScript(address);
        let hash = bitcoin.crypto.sha256(script).reverse().toString('hex');

        let txidList = await esm.electrumRequest('blockchain.scripthash.get_history', [hash]);
        let txidSet = JSON.parse(txidList);
        if (txidSet.result) results = txidSet.result;
    }

    if (results) {
        res.send(results);
    } else {
        res.status(400);
        res.send(false);
    }
});

module.exports = router;
