const Socket = require('json-rpc-tls').Socket;
let logger = require('./logger').winston;

let connection;
let globalSocket;
let idx = 0;

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

electrumRequest = function (type, params) {
    if (!globalSocket.destroyed) {
        return Socket.request(
            globalSocket,
            idx++, // increment req index
            type,
            params ? params : []
        );
    } else {
        connection = null;
        idx = 0;
        return connect(globalServerAddr, globalServerPort)
            .then(electrumRequest(type, params));
    }
};

module.exports = {
    connect: connect,
    electrumRequest: electrumRequest
};
