const MarketManager = require('bittrex-market');
const Promise = require('bluebird');
const EventsEmitter = require('events');
const logger  = require.main.require('./server/util/logger')('bittrex-manager');

module.exports = class BittrexManager extends EventsEmitter {
    constructor() {
        super();
        this.markets = {};
        this.manager = new MarketManager(false);
        this.loadMarket = Promise.promisify(this.manager.market.bind(this.manager));
    }

    async subscribeToPair(market, count = 0) {
        try {
            let currentPair = this.markets[market];
            if (!currentPair) {
                const currentMarket = await this.loadMarket(market).catch(e => logger.error(e));
                currentPair = {
                    market,
                    count
                };
                
                currentMarket.on('orderbook.diff.asks.inserted', event => this.emit(market, { type: 'ask', market: 'bittrix', ...event}));
                currentMarket.on('orderbook.diff.bids.inserted', event => this.emit(market, { type: 'bid', market: 'bittrix', ...event}));
                this.markets[market] = currentPair;
            }
            if (!count) {
                currentPair.count++;
            }
        } catch (err) {
            console.error(err);
            return await Promise.delay(100).then(() => this.subscribeToPair(market, count));
        }
    }

    async unsubscribe(market) {
        logger.debug('unsubscribing from market', market);
        const currentPair = this.markets[market];
        currentPair.count--;
        if (currentPair.count <= 0) {
            logger.debug('unsubscribed from pair', market);
            delete this.markets[market];
            
            // unsubscribe from all markets;
            return Promise.try(() => this.manager.reset()).then(() => {
                //re-wire all subscriptions;
                return Promise.all(Object.values(this.markets).map(({ market, count }) => {
                    delete this.markets[market];
                    return this.subscribeToPair(market, count);
                }));
            }).catch(e => logger.error(e));
        }
    }
};