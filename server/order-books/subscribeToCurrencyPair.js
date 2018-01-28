const logger = require.main.require('./server/util/logger')('subscribeToCurrencyPair');
const Promise = require('bluebird');
const Rx = require('rxjs');

const { ORDERBOOKS } = require.main.require('./shared/actions.json');
const { concatExchanges } = require('../util/concatExchanges');
const fs = require('fs');
const path = require('path');

const exchangeEmitters = fs.readdirSync(path.resolve(__dirname, './exchange-emitters'))
    .map(file => require('./exchange-emitters/' + file));

module.exports = async function subscribeToCurrencyPair(pair, cb) {
    try {
        logger.debug('subscribing to exchanges.');
        const cancelEvents = [];
        const observables = [];
        const events = await Promise.map(exchangeEmitters, subscribeToExchange => subscribeToExchange(pair));

        events.forEach(event => {
            cancelEvents.push(Rx.Observable.fromEvent(event, 'closed'));
            observables.push(Rx.Observable.fromEvent(event, pair).startWith({ asks: [], bids: []}));
        });
        const cancel = Rx.Observable.merge(...cancelEvents);
        const combinedExchangeFeed = Rx.Observable.combineLatest(...observables).map(concatExchanges);

        logger.debug('combine success!');
        const subscription = combinedExchangeFeed
            .takeUntil(cancel)
            .throttle(val => Rx.Observable.interval(1000))
            .subscribe(feed => {
                cb({ type: ORDERBOOKS, payload: feed });
            });
        logger.debug('subscription created');

        return {
            unsubscribe: async () => {
                return await Promise.all(events.map(event => event.emit('unsubscribe')))
                    .then(() => subscription.unsubscribe());
            }
        };
    } catch (err) {
        logger.error(err);
    }
};
