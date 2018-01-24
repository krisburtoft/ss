const EventsEmitter = require('events');
const PoloniexApiPush = require('poloniex-api-push');
const logger  = require.main.require('./server/util/logger')('poloniex-manager');
const Promise = require('bluebird');

class PoloniexManager extends EventsEmitter {
    constructor() {
        super();
        this.manager =  new PoloniexApiPush();
        logger.info('Initializing PoloniexManager');
        this.manager.init().then(_ => {
            this.ready = true;
            logger.info('Poloniex connection ready');
        }).catch(e => logger.error('error initializing poloniex-api-push', e));
        this.markets = {};
    }

    static normalizeMarket(market) {
        return market.replace(/-/, '_');
    }

    subscribeToPair(market) {
        const pair = PoloniexManager.normalizeMarket(market);
        let currentPair = this.markets[pair];
        if (!currentPair) {
            this.manager.subscribe(pair);
            this.manager.on(`${pair}-orderbook-bids`, bid =>  this.emit(market, { type: 'bid', market: 'poloniex', ...bid }));
            this.manager.on(`${pair}-orderbook-asks`, ask =>  this.emit(market, { type: 'ask', market: 'poloniex', ...ask }));
            currentPair = {
                count: 0
            };
            this.markets[pair] = currentPair;
        }

        currentPair.count++;
    }

    async unsubscribe(market) {
        return await Promise.try(() => {
            const pair = PoloniexManager.normalizeMarket(market);

            logger.debug('unsubscribing from pair', pair);
            const currentPair = this.markets[pair];
            currentPair.count--;
            if (currentPair.count <= 0) {
                this.manager.unSubscribe(pair);
                logger.debug('unsubscribed from pair', pair);
                delete this.markets[pair];
            }
        });
    }
}

const manager = new PoloniexManager();

module.exports = async function getManager() {
    return await Promise.try(() => {
        if (manager.ready) {
            return manager;
        }
        return Promise.delay(100);
    });
};
