// set to true if you want to replay historic trades
const BittrexManager = require('./exchange-managers/bittrexManager');
const manager = new BittrexManager();
const buildExchangeEmitter = require('../util/buildExchangeEmitter');
const Promise = require('bluebird');

module.exports = buildExchangeEmitter('bittrex', async function getManager() {
    return manager.ready ? manager : Promise.delay(250).then(getManager);
});
