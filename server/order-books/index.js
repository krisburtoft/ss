const bittrex = require('./bittrex');
const poloniex = require('./poloniex');
const logger = require('../util/logger')('order-books');
const Order = require('../models/order');
const Rx = require('rxjs');
const { CHUNK } = require.main.require('./shared/actions.json');
const Promise = require('bluebird');

module.exports = async function subscribeToMarkets(market, cb) {
    try {
        logger.debug('subscribing to exchanges.');
        const subject = new Rx.Subject();
        const bittrexEvents = await bittrex(market, order => subject.next(new Order(order)));
        const poloniexEvents = await poloniex(market, order => subject.next(new Order(order)));
        const cancelPoloniex = Rx.Observable.fromEvent(poloniexEvents, 'closed');
        const cancelBittrex = Rx.Observable.fromEvent(bittrexEvents, 'closed');
        const cancelEvents = Rx.Observable.merge(cancelPoloniex, cancelBittrex);
        subject.bufferTime(1000).takeUntil(cancelEvents).subscribe({
            next: chunk => {
                logger.error('received chunk', chunk);
                cb({ type: CHUNK, payload: chunk });
            }
        });
        return {
            unsubscribe: async () => {
                return await Promise.try(() => {
                    poloniexEvents.emit('unsubscribe');
                    bittrexEvents.emit('unsubscribe');
                }
                )
                    .then(() => subject.unsubscribe());
            }
        };
    } catch (err) {
        logger.error(err);
    }
};
