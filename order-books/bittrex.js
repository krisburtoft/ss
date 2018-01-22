const MarketManager = require('bittrex-market');
const Rx = require('rxjs');
//set to true if you want to replay historic trades
const marketManager = new MarketManager(false)
const subject = new Rx.ReplaySubject(1);

//access the desired market
exports.subscribe = (marketName /* 'BTC-ETH' */, onUpdate) => {
  marketManager.market(marketName, (err, market) => {
      if (err) {
        console.error(err);
      }
      market.on('orderbookUpdated', subject.next.bind(subject));
      subject.subscribe({
        next: () => onUpdate(market)
      });
  });
}
