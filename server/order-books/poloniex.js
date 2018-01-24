const logger  = require('../util/logger')('poloniex-order-book');
const Promise = require('bluebird');
const getManager = require('./exchange-managers/poloniexManager');
const EventsEmitter = require('events');

module.exports = async function subscribeToPoloniex(marketName) {
    try {
        const manager = await getManager();
        const emitter = new EventsEmitter();
        logger.debug('subscribe|', marketName);
        manager.subscribeToPair(marketName);
        manager.on(marketName, (event) => {
            logger.trace('event|', event);
            emitter.emit(marketName, event);
        });
        emitter.on('unsubscribe', () => {
            emitter.emit('closed');
            manager.unsubscribe(marketName);
        });
        return emitter;
    } catch (err) {
        logger.error(`error in ${marketName}`, err);
        return await Promise.delay(1000).then(() => subscribeToPoloniex(marketName));
    }
};



