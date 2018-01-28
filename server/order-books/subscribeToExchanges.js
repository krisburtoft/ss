const logger = require.main.require('./server/util/logger')('subscribeToExchanges');

const fs = require('fs');
const path = require('path');

const exchangeManagers = fs.readdirSync(path.resolve(__dirname, './exchanges'))
    .map(file => require('./exchanges/' + file));

const ExchangeSubscriptionManager = require('./ExchangeSubscriptionManager');
const manager = new ExchangeSubscriptionManager();

logger.info('registering exchange managers');
exchangeManagers.forEach(m => manager.registerExchangeManager(m));
logger.info('registration complete');

module.exports = async function subscribeToCurrencyPair(pair, cb) {
    return await manager.subscribeToCurrencyPair(pair, cb);
};
