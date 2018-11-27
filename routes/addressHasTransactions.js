var express = require('express');
var router = express.Router();
var esm = require('../services/electrumSocketEmitter');

router.post('/', async function (req, res, next) {
    var address = req.body.address ? req.body.address : "";
    if (!address) {
        res.send(false);
        return;
    }

    const txidList = await esm.electrumRequest('blockchain.address.get_history', [address]);
    const txidSet = JSON.parse(txidList);

    res.setHeader('Content-Type', 'application/json');
    console.log(txidSet);

    if (txidSet.result) {
        res.send(txidSet.result);
    } else {
        res.send(false);
    }
});

module.exports = router;
