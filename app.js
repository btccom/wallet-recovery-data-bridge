var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var logger = require('./services/logger');
var bodyParser = require('body-parser');

// Override max event listerner limits for request bursts
require('events').EventEmitter.prototype._maxListeners = 1000000;

var addressListUnspent = require('./routes/addressListUnspent');
var estimateFeeRate = require('./routes/estimateFeeRate');
var addressHasTransactions = require('./routes/addressHasTransactions');
var publishTransaction = require('./routes/publishTransaction');

// config
var electrumServerHost = process.env.ELECTRUM_SERVER || "satoshi.vision.cash";
var electrumServerPort = process.env.ELECTRUM_SERVER_PORT || 50002;
var serverPort = process.env.SERVER_PORT || 8080;

// Init network connection
var esm = require('./services/electrumSocketEmitter');
esm.connect(electrumServerHost, electrumServerPort);

var app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser({limit: '50mb'}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/addressListUnspent', addressListUnspent);
app.use('/estimateFeeRate', estimateFeeRate);
app.use('/addressHasTransactions', addressHasTransactions);
app.use('/publishTx', publishTransaction);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send("");
});

app.listen(serverPort, function () {
    console.log(`Electrum bridge listening on port ` + serverPort)
});
