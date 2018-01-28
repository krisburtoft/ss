const _ = require('lodash');

const joinDuplicates = module.exports.concatList = function concatList(group, reverse) {
    //eliminate dups from the exchanges and combine them.
    const mappedObject = group.reduce((map, line) => {
        if (map[line.rate]) {
            line.overlaps = true;
            const { exchange, rate, quantity } = map[line.rate];
            exchange.push(...line.exchange);
            map[line.rate] = {
                rate,
                quantity: quantity + line.quantity,
                exchange: _.uniq(exchange)
            };
        } else {
            map[line.rate] = line;
        }
        return map;
    }, {});
    // sort them by value descending
    const sort = reverse ? (a,b) => b.rate - a.rate  : (a,b) => a.rate - b.rate ;
    return Object.values(mappedObject).sort(sort).filter(i => i.quantity !== 0);
};


module.exports.concatExchanges = function concatExchanges(lists) {
    const joined = lists.reduce((map, list) => {
        map.asks = map.asks.concat(list.asks);
        map.bids = map.bids.concat(list.bids);
        return map;
    }, { asks: [], bids: [] });
    const asks = joinDuplicates(joined.asks);
    const bids = joinDuplicates(joined.bids, true);
    return {
        asks,
        bids
    };
};
