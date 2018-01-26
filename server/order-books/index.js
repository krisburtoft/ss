const actions = require('../../shared/actions.json');
const subscribeToMarkets = require('./subscribeToMarkets');
const { loadAvailableMarkets, loadMarketInfo } = require('./markets');

const ACTION_HANDLERS = {
    [actions.JOIN]: async function(action, client) {
        const previousSubscription = client.subscriptions[action.data];
        if (previousSubscription) {
            return;
        }
        const subscription = await subscribeToMarkets(action.data, event => client.emit('action', event));
        client.subscriptions[action.data] = subscription;
    },
    [actions.UNSUBSCRIBE]: (action, client) => {
        const subscription = client.subscriptions[action.data];
        if (!subscription) {
            return;
        }
        subscription.unsubscribe();
        delete client.subscriptions[action.data];
    },
    [actions.LOAD_MARKETS]: async function(action, client) {
        const markets = await loadAvailableMarkets();
        client.emit('action', { 
            type: actions.RECEIVE_MARKETS, 
            payload: markets
        });
    },
    [actions.GET_MARKET_INFO]: async function(action, client) {
        const market  = await loadMarketInfo(action.data);
        client.emit('action', {
            type: actions.RECEIVE_MARKET_INFO,
            payload: market
        });
    }
};

module.exports = function setUpSocket(io) {
    io.on('connection', function(client) {
        client.subscriptions = {};
        client.on('action', function(action) {
            const handler = ACTION_HANDLERS[action.type];
            if (handler) {
                handler(action, client);
            }
        });

        client.on('disconnect', () => {
            Object.values(client.subscriptions).forEach(sub => sub.unsubscribe());
        });
        
    });
};