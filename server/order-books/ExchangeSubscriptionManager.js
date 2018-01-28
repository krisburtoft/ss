const EventsEmitter = require('events');
const logger = require.main.require('./server/util/logger')('exchange-subscription-manager');
const { concatExchanges } = require('../util/concatExchanges');
const Rx = require('rxjs');
const { v1 } = require('uuid');

module.exports = class ExchangeSubscriptionManager extends EventsEmitter {
    constructor() {
        super();
        this.registeredExchanges = [];
        this.registeredPairs = {};
    }

    registerExchangeManager(getManager) {
        const manager = getManager();
        if (!manager.subscribe || !manager.unsubscribe || !manager.name) {
            throw Error('managers must have subscribe functions, unsubscribe functions and a unique exchange name');
        }
        this.registeredExchanges.push(manager);
    }

    subscribeToCurrencyPair(pair, cb) {
        let currentPairRegistration = this.registeredPairs[pair];
        if (!currentPairRegistration) {
            const orderBookEmitEventNames = [];
            this.registeredExchanges.forEach(exchange => {
                const exchangeEvent = `${exchange.name}:${pair}`;
                logger.debug('setting up response event name', exchangeEvent);
                exchange.subscribe(pair, this.emit.bind(this, exchangeEvent));
                orderBookEmitEventNames.push(exchangeEvent);
            });
            const observables = orderBookEmitEventNames.map(eventName => Rx.Observable.fromEvent(this, eventName).startWith({ asks: [], bids: []}));
            const combinedExchangeFeed = Rx.Observable.combineLatest(...observables)
                .map(concatExchanges)
                .throttle(val => Rx.Observable.interval(1000));
            this.registeredPairs[pair] = currentPairRegistration = {
                combinedExchangeFeed,
                subscriptions: {}
            };
        }

        const subscription = this.registeredPairs[pair].combinedExchangeFeed.subscribe(cb);
        const subscriptionId = v1();
        this.registeredPairs[pair].subscriptions[subscriptionId] = subscription;
        return this.unsubscribe.bind(this, subscriptionId, pair);

    }

    unsubscribe(id, pair) {
        const currentPairRegistration = this.registeredPairs[pair];
        if (currentPairRegistration && currentPairRegistration.subscriptions[id]) {
            currentPairRegistration.subscriptions[id].unsubscribe();
            delete currentPairRegistration.subscriptions[id];
            if (Object.keys(currentPairRegistration.subscriptions).length === 0) {
                logger.info(`all subscriptions have been resolved for pair ${pair}`);
                this.registeredExchanges.forEach(exchange => exchange.unsubscribe(pair));
                delete this.registeredPairs[pair];
            }
        }
    }
};
