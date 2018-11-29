// blockchain.estimatefee
var express = require('express');
var router = express.Router();
var esm = require('../services/electrumSocketEmitter');
var utils = require('../services/utils');

router.get('/', async function (req, res, next) {
    // TODO sanity check is numeric/integer
    let confirmations = req.query.confirmations ? req.query.confirmations : 3;
    if (!confirmations) {
        res.send(false);
        return;
    }
    res.setHeader('Content-Type', 'application/json');
    let result = {};
    let feeResponse = await esm.electrumRequest('blockchain.estimatefee', [confirmations]);
    let feeObj = JSON.parse(feeResponse);
    if (feeObj.result) result[confirmations] = feeObj.result;

    if (result) {
        res.send(result);
    } else {
        res.status(400);
        res.send(false);
    }
});

module.exports = router;
