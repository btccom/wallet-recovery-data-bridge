var express = require('express');
var router = express.Router();
var esm = require('../services/electrumSocketEmitter');

router.post('/', async function (req, res, next) {
    var address = req.body.address ? req.body.address : "";
    if (!address) {
        res.send(false);
        return;
    }

    const utxoSet = await esm.electrumRequest('blockchain.address.listunspent', [address]);
    const objUtxoSet = JSON.parse(utxoSet);

    res.setHeader('Content-Type', 'application/json');
    console.log(utxoSet);

    if (objUtxoSet.result) {
        res.send(objUtxoSet.result);
    } else {
        res.send(false);
    }
});

module.exports = router;
