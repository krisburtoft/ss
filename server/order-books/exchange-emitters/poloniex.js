const Promise = require('bluebird');
const CryptopiaManager = require('../exchange-managers/cryptopiaManager');
const manager = new CryptopiaManager();
const buildExchangeEmitter = require('../../util/buildExchangeEmitter');

module.exports = buildExchangeEmitter('cryptopia', async function getManager() {
    return manager;
});
