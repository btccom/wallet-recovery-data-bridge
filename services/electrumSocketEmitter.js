const Socket = require('json-rpc-tls').Socket;

var connection;
var socketGlobe;
var idx = 0;

connect = function(serverAddr, serverPort) {
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
            socketGlobe = socket;
        }).catch((error) => {
            console.log(error.error);
            Socket.close(error.socket);
        });
    }

    return connection
};


electrumRequest = function (type, params) {
    if (connection) {
        return Socket.request(
            socketGlobe,
            idx++, // increment req index
            type,
            params ? params : []
        );
    }
    throw new Error('Not connected.');
};

module.exports = {
    connect: connect,
    electrumRequest: electrumRequest
};
