const concatList = module.exports.concatList = function concatList(a, b, reverse) {
    //eliminate dups from the exchanges and combine them.
    const mappedObject = a.concat(b).reduce((map, line) => {
        if (map[line.rate]) {
            line.overlaps = true;
            const quantity = map[line.rate].quantity + line.quantity;
            map[line.rate] = {
                rate: line.rate,
                quantity,
                exchange: [...map[line.rate].exchange, ...line.exchange]
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
    const a = lists[0];
    const b = lists[1];
    const asks = concatList(a.asks, b.asks);
    const bids = concatList(a.bids, b.bids, true);
    return {
        asks,
        bids
    };
};