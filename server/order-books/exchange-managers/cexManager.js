const Promise = require('bluebird');
const EventsEmitter = require('events');
const logger = require.main.require('./server/util/logger')('gdax-manager');
const Gdax = require('gdax');

module.exports = class CexManager extends EventsEmitter {
    constructor() {
        super();
        logger.info('connecting');
        this.markets = {};
    }

    processBook(market, { asks, bids}) {
        const volumes = {
            asks: CexManager.parseGroup(asks),
            bids: CexManager.parseGroup(bids)
        };
        this.emit(market, volumes);
    }

    static parseGroup(group) {
        return Object.values(group).map(info => ({ exchange: ['gdax'], rate: info.price.toString(), quantity: info.size }));
    }

    async subscribeToPair(market, count = 0) {
        try {
            let currentPair = this.markets[market];
            if (!currentPair) {
                logger.debug('starting new subscription to book ', market);
                const bookSync = new Gdax.OrderbookSync(['ETH-USD']);
                const cancelToken = setInterval(() => this.processBook(market, bookSync.books['ETH-USD'].state()), 2500);

                currentPair = {
                    bookSync,
                    cancelToken,
                    count
                };

                this.markets[market] = currentPair;
            }
            currentPair.count++;
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
            clearInterval(currentPair.cancelToken);
            delete this.markets[market];
        }
    }
};