# Wallet Recovery Data Bridge

"TLS socket to HTTP" bridge for certain endpoints of ElectrumX servers

## Installation

* `git clone` this repo
* `npm install`
* `node app.js`

## Environment variables
| ENV variable  | Meaning |
| --------- | ------------------ |
| `ELECTRUM_SERVER`   | Electrum server address to connect to |
| `ELECTRUM_SERVER_PORT`   | Electrum server port to connect to |
| `NODE_ENV` | Log level `'production'` / `'debug'` |
| `SERVER_PORT` | HTTP server port, default is 8080 |


## Existing Endpoints on the bridge

#### GET

| Endpoint  | Request parameters |
| --------- | ------------------ |
| `/estimateFeeRate`   |  optional: `confirmations` to set priority in amount of blocks |

#### POST

| Endpoint  | Request parameters |
| --------- | ------------------ |
| `/addressHasTransactions`  | `{"address": arrayOfAddresses/address }`  |
| `/addressListUnspent`  | `{"address": address }`  |
| `/publishTx`  | `{"tx": txAsHexString }`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
