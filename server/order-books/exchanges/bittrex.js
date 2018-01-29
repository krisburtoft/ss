const Promise = require('bluebird');
const logger = require.main.require('./server/util/logger')('bittrex-manager');
const BittrexClient = require('bittrex-orderbook-manager');

function parseGroup(group) {
    return Object.values(group).map(info => ({ exchange: ['bittrex'], rate: info.rate.toFixed(8), quantity: info.quantity }));
}

module.exports = function getBittrexManager() {
    logger.info('connecting');
    const manager = new BittrexClient();
    let ready = false;
    manager.connect().then(client => {
        logger.info('connected');
        ready = true;
    });

    const bittrexManager = {
        name: 'bittrex',
        subscribe: async function subscribeToPair(pair, callback, count = 0) {
            try {
                logger.debug('subscribing to pair', pair);
                if (!ready) {
                    logger.info('subscribeToPair| bittrex not ready, retrying');
                    return Promise.delay(250).then(() => bittrexManager.subscribe(pair, callback, count));
                }

                const orderBook = manager.orderBook(pair);
                orderBook.on('update', () => {
                    logger.trace('orderbook update');
                    const { asks, bids } = orderBook.orders;
                    const volumes = {
                        asks: parseGroup(asks),
                        bids: parseGroup(bids)
                    };
                    callback(volumes);
                });
                orderBook.on('error', (err) => {
                    if (err === 'No Hub') {
                        logger.error('signalR connection error', err);
                        logger.info('retrying');
                        return Promise.delay(250).then(() => bittrexManager.subscribe(pair, callback, count));
                    }
                    logger.error(err);
                });

                orderBook.on('started', () => {
                    logger.info('order book started', pair);
                });
                orderBook.start();

            } catch (err) {
                logger.error(err);
            }
        },
        unsubscribe: function unsubscribe(pair) {
            logger.debug('unsubscribed from pair', pair);
            delete manager.orderBooks[pair];
        }
    };
    return bittrexManager;
};
