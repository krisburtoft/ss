const Promise = require('bluebird');
const EventsEmitter = require('events');
const logger = require.main.require('./server/util/logger')('bittrex-manager');
const BittrexClient = require('bittrex-orderbook-manager');
module.exports = class BittrexManager extends EventsEmitter {
    constructor() {
        super();
        logger.info('connecting');
        this.markets = {};
        this.ready = false;
        this.manager = new BittrexClient();
        this.manager.connect().then(client => {
            logger.info('connected');
            this.ready = true;
        });

    }

    static parseGroup(group) {
        return Object.values(group).map(info => ({ exchange: ['bittrex'], rate: info.rate.toFixed(8), quantity: info.quantity }));
    }

    async subscribeToPair(market, count = 0) {
        try {
            if (!this.ready) {
                return Promise.delay(250).then(() => this.subscribeToPair(market, count));
            }
            let currentPair = this.markets[market];
            if (!currentPair) {
                const orderBook = this.manager.orderBook(market);
                orderBook.on('update', () => {
                    const { asks, bids } = orderBook.orders;
                    const volumes = {
                        asks: BittrexManager.parseGroup(asks),
                        bids: BittrexManager.parseGroup(bids)
                    };
                    this.emit(market, volumes);
                });
                orderBook.on('error', (err) => {
                    if (err === 'No Hub') {
                        logger.error('signalR connection error', err);
                        logger.info('retrying');
                        return Promise.delay(250).then(() => this.subscribeToPair(market, count));
                    }
                    logger.error(err);
                });

                orderBook.on('started', () => {
                    logger.info('order book started', market);
                });

                currentPair = {
                    market,
                    count,
                    orderBook
                };

            }
            const { orderBook } = currentPair;
            orderBook.start();
            currentPair.count++;
            this.markets[market] = currentPair;
        } catch (err) {
            logger.error(err);
            return await Promise.delay(250).then(() => this.subscribeToPair(market, count));
        }
    }

    async unsubscribe(market) {
        logger.debug('unsubscribing from market', market);
        const currentPair = this.markets[market];
        currentPair.count--;
        if (currentPair.count <= 0) {
            logger.debug('unsubscribed from pair', market);
            delete this.markets[market];
            delete this.manager.orderBooks[market];
        }
    }
};
