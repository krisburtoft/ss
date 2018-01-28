module.exports = {
    combineAndSort,
    concatExchanges
};

function combineAndSort(group, reverse) {
    //eliminate dups from the exchanges and combine them.
    const mappedObject = group.reduce((map, line) => {
        if (map[line.rate]) {
            line.overlaps = true;
            const { exchange, rate, quantity } = map[line.rate];
            const newExchange = exchange.concat(line.exchange);
            map[line.rate] = {
                rate,
                quantity: quantity + line.quantity,
                exchange: newExchange
            };
        } else {
            map[line.rate] = { ...line };
        }
        return map;
    }, {});
    // sort them by value descending
    const sort = reverse ? (a,b) => b.rate - a.rate  : (a,b) => a.rate - b.rate ;
    return Object.values(mappedObject).sort(sort).filter(i => i.quantity !== 0);
}


function concatExchanges(lists) {
    const joined = lists.reduce((map, list) => {
        map.asks = map.asks.concat(list.asks);
        map.bids = map.bids.concat(list.bids);
        return map;
    }, { asks: [], bids: [] });
    const asks = combineAndSort(joined.asks);
    const bids = combineAndSort(joined.bids, true);
    return {
        asks,
        bids
    };
}
