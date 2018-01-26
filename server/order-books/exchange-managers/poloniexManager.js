const EventsEmitter = require('events');
const logger  = require.main.require('./server/util/logger')('poloniex-manager');
const Promise = require('bluebird');
const Poloniex = require('poloniex-api-node');

module.exports = class PoloniexManager extends EventsEmitter {
    constructor() {
        super();
        this.manager =  new Poloniex();
        logger.info('Initializing PoloniexManager');
        this.manager.on('open', ()=> {
            this.ready = true;
            logger.info('Poloniex connection ready');
        });
        this.manager.on('message', (channelName, dataSet, seq) => {
            if (!this.markets[channelName]) {
                return;
            }
            logger.trace('receive message', channelName, dataSet, seq);
            const message = dataSet[0];
            switch(message.type) {
            case 'orderBook': {
                this.markets[channelName].data = message.data;
                break;
            }
            case 'orderBookModify': {
                switch (message.data.type) {
                case 'bid':
                case 'ask':
                    this.markets[channelName].data[`${message.data.type}s`][message.data.rate] = message.data.amount;
                    break;
                default:
                    logger.trace('unknown modify type', message.data.type);
                    break;
                }
                break;
            }
            case 'orderBookRemove': {
                delete this.markets[channelName].data[`${message.data.type}s`][message.data.rate];
                break;
            }
            }
            const { asks, bids } =  this.markets[channelName].data;
            const normalizedFeed = {
                asks: PoloniexManager.parseGroup(asks),
                bids: PoloniexManager.parseGroup(bids)
            };
            this.emit(PoloniexManager.parseMarket(channelName), normalizedFeed);
        });

        this.manager.on('error', e => {
            if (e.code === 'ECONNRESET') {
                this.manager.openWebSocket({ version: 2 });
            }
            logger.error(e);
        });
        this.manager.openWebSocket({ version: 2 });
        this.markets = {};
    }

    static parseGroup(group) {
        return Object.keys(group).map(rate => ({ exchange: ['poloniex'], rate , quantity: parseFloat(group[rate]) }));
    }

    static normalizeMarket(market) {
        return market.replace(/-/, '_');
    }

    static parseMarket(pair) {
        return pair.replace(/_/, '-');
    }

    async subscribeToPair(market) {
        const pair = PoloniexManager.normalizeMarket(market);
        let currentPair = this.markets[pair];
        if (!currentPair) {
            this.manager.subscribe(pair);
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
                this.manager.unsubscribe(pair);
                logger.debug('unsubscribed from pair', pair);
                delete this.markets[pair];
            }
        });
    }
};
