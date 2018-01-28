const getLogger = require.main.require('./server/util/logger');
const EventsEmitter = require('events');
const Promise = require('bluebird');

module.exports = function buildExchangeEmitter(name, getManager) {
    const logger = getLogger(`${name}-exchange-order-books`);
    return async function subscribeToExchange(marketName) {
        try {
            logger.trace('registering');
            const manager = await getManager();
            const emitter = new EventsEmitter();
            logger.debug('subscribing to ', marketName);
            await manager.subscribeToPair(marketName);
            manager.on(marketName, (event) => {
                logger.trace('orderBook', event);
                emitter.emit(marketName, event);
            });
            emitter.on('unsubscribe', () => {
                emitter.emit('closed');
                logger.trace('closing');
                manager.unsubscribe(marketName);
            });
            return emitter;
        } catch (err) {
            logger.error(`error in ${marketName}`, err);
            return await Promise.delay(1000).then(() => subscribeToExchange(marketName, getManager));
        }
    };
};
