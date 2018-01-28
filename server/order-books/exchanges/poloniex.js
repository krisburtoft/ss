const logger  = require.main.require('./server/util/logger')('poloniex-manager');
const Poloniex = require('poloniex-api-node');

function parseGroup(group) {
    return Object.keys(group).map(rate => ({ exchange: ['poloniex'], rate , quantity: parseFloat(group[rate]) }));
}

function parsePair(pair) {
    return pair.replace(/-/, '_');
}

module.exports = function getPoloniexManager() {
    const manager =  new Poloniex();
    let ready = false;
    const pairs = {};

    logger.info('Initializing PoloniexManager');
    manager.on('open', ()=> {
        ready = true;
        logger.info('Poloniex connection ready');
    });
    manager.on('message', (pair, dataSet, seq) => {
        if (!pairs[pair]) {
            return;
        }
        logger.trace('receive message', pair, dataSet, seq);
        const message = dataSet[0];
        switch(message.type) {
        case 'orderBook': {
            pairs[pair].data = message.data;
            break;
        }
        case 'orderBookModify': {
            switch (message.data.type) {
            case 'bid':
            case 'ask':
                pairs[pair].data[`${message.data.type}s`][message.data.rate] = message.data.amount;
                break;
            default:
                logger.trace('unknown modify type', message.data.type);
                break;
            }
            break;
        }
        case 'orderBookRemove': {
            delete pairs[pair].data[`${message.data.type}s`][message.data.rate];
            break;
        }
        }
        const { asks, bids } =  pairs[pair].data;
        const orderBook = {
            asks: parseGroup(asks),
            bids: parseGroup(bids)
        };
        pairs[pair].emit(orderBook);
    });
    manager.on('error', e => {
        if (e.code === 'ECONNRESET') {
            manager.openWebSocket({ version: 2 });
        }
    });
    manager.openWebSocket({ version: 2 });

    const poloniexmanager = {
        name: 'poloniex',
        subscribe: async function subscribeToPair(pair, callback) {
            logger.debug('subscribing to pair', pair);

            if (!ready) {
                logger.debug('waiting until manager is ready');
                return Promise.delay(250).then(() => poloniexmanager.subscribe(pair, callback));
            }
            const parsedPair = parsePair(pair);
            logger.debug('normalized pair being sent to subscribe', parsePair);
            manager.subscribe(parsedPair);
            pairs[parsedPair] = {
                emit: callback
            };
        },
        unsubscribe: function unsubscribe(pair) {
            const parsedPair = parsePair(pair);
            logger.debug('unsubscribing from pair', parsedPair);
            manager.unsubscribe(parsedPair);
            logger.debug('unsubscribed from pair', parsedPair);
        }
    };
    return poloniexmanager;
};
