const actions = require('../../shared/actions.json');
const logger = require('../util/logger')('order-books-websocket-server');
const { loadAvailableMarkets, loadMarketInfo } = require('./markets');
const fs = require('fs');
const path = require('path');
const exchangeManagers = fs.readdirSync(path.resolve(__dirname, './exchanges'))
    .map(file => require('./exchanges/' + file));
const ExchangeSubscriptionManager = require('./ExchangeSubscriptionManager');
const manager = new ExchangeSubscriptionManager();

logger.info('registering exchange managers');
exchangeManagers.forEach(m => manager.registerExchangeManager(m));
logger.info('registration complete');

const ACTION_HANDLERS = {
    [actions.JOIN]: async function(action, client) {
        logger.debug('subscribing to market', action);

        const previousSubscription = client.subscriptions[action.data];
        if (previousSubscription) {
            return;
        }
        const subscription = await manager.subscribeToCurrencyPair(action.data, orderBook => client.emit('action', { type: actions.ORDERBOOKS, payload: orderBook }));
        client.subscriptions[action.data] = subscription;
    },
    [actions.UNSUBSCRIBE]: (action, client) => {
        logger.debug('unsubscribing from market', action);

        const unsubscribe = client.subscriptions[action.data];
        if (!unsubscribe) {
            return;
        }
        unsubscribe();
        delete client.subscriptions[action.data];
    },
    [actions.LOAD_MARKETS]: async function(action, client) {
        logger.debug('fetching available markets', action);

        const markets = await loadAvailableMarkets();
        client.emit('action', {
            type: actions.RECEIVE_MARKETS,
            payload: markets
        });
    },
    [actions.GET_MARKET_INFO]: async function(action, client) {
        logger.debug('fetching market info', action);

        const market  = await loadMarketInfo(action.data);
        client.emit('action', {
            type: actions.RECEIVE_MARKET_INFO,
            payload: market
        });
    }
};

module.exports = function setUpWebSocketServer(io) {
    io.on('connection', function(client) {
        client.subscriptions = {};
        client.on('action', function(action) {
            const handler = ACTION_HANDLERS[action.type];
            if (handler) {
                handler(action, client);
            }
        });
        client.on('disconnect', () => {
            Object.values(client.subscriptions).forEach(unsubscribe => unsubscribe());
        });

    });
};
