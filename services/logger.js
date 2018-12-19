let winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    error: 'ERROR',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()]
});

module.exports = {
    winston: logger
};
