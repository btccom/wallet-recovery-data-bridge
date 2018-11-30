const Socket = require('json-rpc-tls').Socket;

var connection;
var globalSocket;
var idx = 0;

var globalServerAddr = "";
var globalServerPort = 50002;

connect = function(serverAddr, serverPort) {
    console.log(`Connecting to ${serverAddr} on port ${serverPort}...`);
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
            console.log(`Connected on ${serverAddr}, port ${serverPort}`);
            // set heartbeat
            (async function heartbeat() {
                console.debug("heartbeat sent");
                await electrumRequest('blockchain.estimatefee', [3]);
                console.debug("heartbeat received");
                setTimeout(heartbeat, 60 * 1000)
            })();
        }).catch((error) => {
            console.log(error.error);
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
