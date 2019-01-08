let path = require('path');

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },
    ganache: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    }
  }
};