const Promise = require('bluebird');
const EventsEmitter = require('events');
const logger = require.main.require('./server/util/logger')('cryptopia-manager');
const axios = require('axios');

module.exports = class CryptopiaManager extends EventsEmitter {
    constructor({
        intervalInMilliseconds = 5000
    } = {}) {
        super();
        logger.info('initializing cryptopia exchange manager');
        this.markets = {};
        this.intervalInMilliseconds = intervalInMilliseconds;
    }

    static normalizeGroup(group) {
        return Object.values(group).map(info => ({ exchange: ['cryptopia'], rate: info.Price.toFixed(8), quantity: info.Volume }));
    }

    static parseMarket(market) {
        return market.split('-').reverse().join('_');
    }

    async subscribeToPair(market, count = 0) {
        const pair = CryptopiaManager.parseMarket(market);
        try {
            let currentPair = this.markets[market];
            if (!currentPair) {
                const orderBookId = setInterval(() => {
                    axios.get(`https://www.cryptopia.co.nz/api/GetMarketOrders/${pair}`).then(({data}) => {
                        logger.trace('orderbook', data);
                        if (data.Success) {
                            const { Buy, Sell } = data.Data;
                            const volumes = {
                                asks: CryptopiaManager.normalizeGroup(Sell),
                                bids: CryptopiaManager.normalizeGroup(Buy)
                            };
                            this.emit(market, volumes);
                        } else {
                            logger.error('data');
                            this.emit('error', data);
                        }
                    }).catch(e => {
                        logger.error(e);
                        this.emit('error', e);
                    });
                }, this.intervalInMilliseconds);

                currentPair = {
                    market,
                    count,
                    orderBookId
                };

            }
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
            clearInterval(currentPair.orderBookId);
            delete this.markets[market];
        }
    }
};
