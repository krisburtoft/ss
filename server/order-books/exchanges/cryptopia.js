const logger = require.main.require('./server/util/logger')('cryptopia-manager');
const axios = require('axios');

function parsePair(pair) {
    return pair.split('-').reverse().join('_');
}

function normalizeGroup(group) {
    return Object.values(group).map(info => ({ exchange: ['cryptopia'], rate: info.Price.toFixed(8), quantity: info.Volume }));
}

const intervalInMilliseconds = 3000;
const pairs = {};
module.exports = function getCryptopiaManager() {
    return {
        name: 'cryptopia',
        subscribe: async function subscribeToPair(pair, callback) {
            logger.debug('subscribing to pair', pair);

            const orderBookId = setInterval(() => {
                axios.get(`https://www.cryptopia.co.nz/api/GetMarketOrders/${parsePair(pair)}`).then(({ data }) => {
                    logger.trace('orderbook data retrieved');
                    if (data.Success) {
                        const { Buy, Sell } = data.Data;
                        const volumes = {
                            asks: normalizeGroup(Sell),
                            bids: normalizeGroup(Buy)
                        };
                        callback(volumes);
                    } else {
                        logger.error('data');
                    }
                });
            }, intervalInMilliseconds);

            pairs[pair] = orderBookId;
        },
        unsubscribe: pair => clearInterval(pairs[pair])
    };
};
