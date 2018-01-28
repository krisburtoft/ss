// set to true if you want to replay historic trades
const BittrexManager = require('../exchange-managers/bittrexManager');
const manager = new BittrexManager();
const buildExchangeEmitter = require.main.require('./server/util/buildExchangeEmitter');
const Promise = require('bluebird');
const logger = require.main.require('./server/util/logger')('bittrex-exchange-emitter');

module.exports = buildExchangeEmitter('bittrex', async function getManager(tries = 10) {
    if (tries <= 0) {
        logger.error('unable to connect to bittrex');
        process.exit(1);
    }
    return manager.ready ? manager : Promise.delay(250).then(getManager.bind(null, tries - 1));
});
