const Promise = require('bluebird');
const PoloniexManager = require('./exchange-managers/poloniexManager');
const manager = new PoloniexManager();
const buildExchangeEmitter = require('../util/buildExchangeEmitter');

module.exports = buildExchangeEmitter('poloniex', async function getManager() {
    return manager.ready ? manager : Promise.delay(250).then(getManager);
});


