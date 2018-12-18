var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var addressListUnspent = require('./routes/addressListUnspent');
var estimateFeeRate = require('./routes/estimateFeeRate');
var addressHasTransactions = require('./routes/addressHasTransactions');
var publishTransaction = require('./routes/publishTransaction');

// Init network connection
var esm = require('./services/electrumSocketEmitter');
esm.connect('satoshi.vision.cash', 50002);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

app.listen(process.env.SERVER_PORT || 8080, function () {
    console.log(`Electrum bridge listening on port 8080`)
});
