const bittrex = require('./bittrex');
const poloniex = require('./poloniex');
const cryptopia = require('./cryptopia');
const logger = require('../util/logger')('subScribeToMarkets');
const Rx = require('rxjs');
const { ORDERBOOKS } = require.main.require('./shared/actions.json');
const Promise = require('bluebird');
const { concatExchanges } = require('../util/concatExchanges');

module.exports = async function subscribeToMarkets(market, cb) {
    try {
        logger.debug('subscribing to exchanges.');
        const markets = [bittrex, poloniex, cryptopia];
        const cancelEvents = [];
        const observables = [];
        const events = await Promise.map(markets, async function(m) {
          return await m(market);
        });

        events.forEach(event => {
          cancelEvents.push(Rx.Observable.fromEvent(event, 'closed'));
          observables.push(Rx.Observable.fromEvent(event, market).startWith({ asks: [], bids: []}))
        });
        const cancel = Rx.Observable.merge(...cancelEvents);
        const combinedMarketFeed = Rx.Observable.combineLatest(...observables).map(concatExchanges);

        logger.debug('combine success!');
        const subscription = combinedMarketFeed
          .takeUntil(cancel)
          .throttle(val => Rx.Observable.interval(2000))
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
