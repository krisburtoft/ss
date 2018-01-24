// set to true if you want to replay historic trades
const logger = require('../util/logger')('bittrix-order-book');
const BittrexManager = require('./exchange-managers/bittrexManager');
const manager = new BittrexManager();
const Promise = require('bluebird');
const EventsEmitter = require('events');

module.exports = async function subscribeToBittrix(marketName, cb) {
    try {
        logger.debug('subscribe|', marketName);
        await manager.subscribeToPair(marketName);
        const emitter = new EventsEmitter();

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
        return await Promise.delay(1000).then(() => subscribeToBittrix(marketName, cb));
    }
};
