const axios = require('axios');
const logger = require('../util/logger')('markets');
const BITTREX_MARKETS_URL = 'https://bittrex.com/api/v1.1/public/getmarkets';
const POLONIEX_MARKETS_URL = 'https://poloniex.com/public?command=returnTicker';
const CRYPTOPIO_MARKETS_URL = 'https://www.cryptopia.co.nz/api/GetTradePairs';

const Promise = require('bluebird');

exports.loadAvailableMarkets = async function loadAvailableMarkets() {
    return Promise.all([
        axios.get(BITTREX_MARKETS_URL),
        axios.get(POLONIEX_MARKETS_URL),
        axios.get(CRYPTOPIO_MARKETS_URL)])
        .spread((bittrex, poloniex, cryptopia) => {
            const cryptopiaMap = cryptopia.data.Data.reduce((map, currency) => {
                map[`${currency.BaseSymbol}-${currency.Symbol}`] = currency.Status === 'OK';
                return map;
            }, {});
            
            return bittrex.data.result.filter(i =>
                i.IsActive && poloniex.data[i.MarketName.replace(/-/, '_')] && cryptopiaMap[i.MarketName])
                .map(i => ({
                    name: i.MarketCurrencyLong,
                    id: i.MarketName,
                    logoUrl: i.LogoUrl,
                    baseCurrency: i.BaseCurrencyLong
                }))
                .sort((a, b) => a.name > b.name ? 1 : -1);

        })
        .catch(e => logger.error(e));
};

exports.loadMarketInfo = async function loadMarketInfo(market) {
    return axios.get(BITTREX_MARKETS_URL)
        .then(({ data }) => {
            const marketOfInterest = data.result.find(i => i.MarketName === market) || {};
            return {
                name: marketOfInterest.MarketCurrencyLong,
                id: marketOfInterest.MarketName,
                logoUrl: marketOfInterest.LogoUrl,
                baseCurrency: marketOfInterest.BaseCurrencyLong
            };
        }).catch(e => logger.error(e));
};
