const bittrex = require('./bittrex');
const poloniex = require('./poloniex');
const logger = require('../util/logger')('subScribeToMarkets');
const Rx = require('rxjs');
const { ORDERBOOKS } = require.main.require('./shared/actions.json');
const Promise = require('bluebird');
const { concatExchanges } = require('../util/concatExchanges');

module.exports = async function subscribeToMarkets(market, cb) {
    try {
        logger.debug('subscribing to exchanges.');
        const bittrexEvents = await bittrex(market);
        const poloniexEvents = await poloniex(market);
        const cancelPoloniex = Rx.Observable.fromEvent(poloniexEvents, 'closed');
        const cancelBittrex = Rx.Observable.fromEvent(bittrexEvents, 'closed');
        const cancelEvents = Rx.Observable.merge(cancelPoloniex, cancelBittrex);

        const poloniexObservable =  Rx.Observable.fromEvent(poloniexEvents, market);
        const bittrexObsersevable = Rx.Observable.fromEvent(bittrexEvents, market).startWith({ asks: [], bids: []});
        const combinedMarketFeed = Rx.Observable.combineLatest(poloniexObservable, bittrexObsersevable).map(concatExchanges);
        logger.debug('combine success!');
        const subscription = combinedMarketFeed.subscribe(feed => {
            cb({ type: ORDERBOOKS, payload: feed });
        });
        logger.debug('subscription created');
        return {
            unsubscribe: async () => {
                return await Promise.try(() => {
                    poloniexEvents.emit('unsubscribe');
                    bittrexEvents.emit('unsubscribe');
                })
                .then(() => subscription.unsubscribe());
            }
        };
    } catch (err) {
        logger.error(err);
    }
};
