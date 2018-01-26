const axios = require('axios');
const logger = require('../util/logger')('markets');
const BITTREX_MARKETS_URL = 'https://bittrex.com/api/v1.1/public/getmarkets';
const POLONIEX_MARKETS_URL = 'https://poloniex.com/public?command=returnTicker';

const Promise = require('bluebird');
exports.loadAvailableMarkets = async function loadAvailableMarkets() {
    return Promise.all([
        axios.get(BITTREX_MARKETS_URL),
        axios.get(POLONIEX_MARKETS_URL)])
        .spread((bittrex, poloniex) => {
            return bittrex.data.result.filter(i => 
                i.IsActive && poloniex.data[i.MarketName.replace(/-/, '_')])
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