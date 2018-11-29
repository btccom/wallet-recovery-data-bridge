var express = require('express');
var router = express.Router();
var esm = require('../services/electrumSocketEmitter');

router.post('/', async function (req, res, next) {
    var txhex = req.body.tx ? req.body.tx : "";
    if (!txhex) {
        res.send(false);
        return;
    }

    // serialized, hex-encoded
    const publishResult = await esm.electrumRequest('blockchain.transaction.broadcast', [txhex]);
    const publishResultObj = JSON.parse(publishResult);

    res.setHeader('Content-Type', 'application/json');
    console.log(publishResultObj);


    if (publishResultObj.result) {
        res.send({ 'txid': publishResultObj.result });
    } else if (publishResultObj.error && publishResultObj.error.message) {
        res.status(400);
        res.send(publishResultObj.error.message);
    }
});

module.exports = router;
