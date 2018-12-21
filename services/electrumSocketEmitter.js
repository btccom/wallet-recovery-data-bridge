const Socket = require('json-rpc-tls').Socket;
let logger = require('./logger').winston;
let AsyncLock = require('async-lock');

let connection;
let globalSocket;
let idx = 0;
let globalLock = new AsyncLock();

let globalServerAddr = "";
let globalServerPort = 50002;

connect = function(serverAddr, serverPort) {
    logger.info(`Connecting to ${serverAddr} on port ${serverPort}...`);
    if (serverAddr) {
        globalServerAddr = serverAddr;
    }

    if (serverPort) {
        globalServerPort = serverPort;
    }

    if(!connection) {
        connection = Socket.tlsSocket(serverAddr, serverPort, {
            rejectUnauthorized: false,
            checkServerIdentity: function () {
            }, // Self signed cert
        }).then(async (socket) => {
            // Set options
            socket.setEncoding('utf8');
            socket.setKeepAlive(true, 0);
            socket.setNoDelay(true);
            globalSocket = socket;
            logger.info(`Connected on ${serverAddr}, port ${serverPort}`);
            // set heartbeat
            (async function heartbeat() {
                logger.debug("heartbeat sent");
                await electrumRequest('blockchain.estimatefee', [3]);
                logger.debug("heartbeat received");
                setTimeout(heartbeat, 60 * 1000)
            })();
        }).catch((error) => {
            logger.info(error.error);
            Socket.close(error.socket);
        });
    }

    return connection;
};

// Because Promise.defer() is not a function and we shouldn't have to import 'q' for this
// https://stackoverflow.com/a/27890038
function defer() {
    let deferred = {};
    let promise = new Promise(function(resolve, reject) {
        deferred.reject  = reject;
        deferred.resolve = resolve;
    });
    deferred.promise = promise;
    return deferred;
}


electrumRequest = function (type, params) {
    let deferred = defer();

    globalLock.acquire("req", async function (done) {
        logger.debug("lock acquired");
        if (!globalSocket.destroyed) {
            let response = await Socket.request(
                globalSocket,
                idx++, // increment req index
                type,
                params ? params : []
            );
            deferred.resolve(response);
            done();
        } else {
            connection = null;
            idx = 0;
            done();
            deferred.resolve(connect(globalServerAddr, globalServerPort)
                .then(electrumRequest(type, params)));
        }
    }, function () { logger.debug("lock released")}, { });

    return deferred.promise;
};

module.exports = {
    connect: connect,
    electrumRequest: electrumRequest
};
