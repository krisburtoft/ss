const MarketManager = require('bittrex-market')

//set to true if you want to replay historic trades
const marketManager = new MarketManager(false)

//access the desired market
exports.subscribe = (marketName /* 'BTC-ETH' */, onData, onFill, onUpdate) =>
  marketManager.market(marketName, (err, market) => {
      if (err) {
        console.error(err);
      }
      market.on('fills', onFill);
      market.on('orderbookUpdated', onUpdate);
      sides = ['asks', 'bids']
      eventTypes = ['removed', 'inserted', 'updated']

      sides.forEach((side) => {
          eventTypes.forEach((type) => {
              market.on(`orderbook.diff.${side}.${type}`, (event) => {
                  onData(side, type, event)
              })
          })
      })
  })
