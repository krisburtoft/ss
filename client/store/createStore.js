import { applyMiddleware, compose, createStore } from 'redux';
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';
import actions from '../../shared/actions.json';
import { makeRootReducer } from './reducers';
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import reducers from './reducers' // Or wherever you keep your reducers

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const router = routerMiddleware(history);

let socket = io();
let socketIoMiddleware = createSocketIoMiddleware(socket, (action) => {
    return Object.values(actions).includes(action);
});

import thunk from 'redux-thunk';

export default (initialState = {}) => {
    // ======================================================
    // Middleware Configuration
    // ======================================================
    const middleware = [thunk, socketIoMiddleware, router];

    // ======================================================
    // Store Enhancers
    // ======================================================
    const enhancers = [];

    let composeEnhancers = compose;

    if (process.env.NODE_ENV === 'development') {
        const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
        if (typeof composeWithDevToolsExtension === 'function') {
            composeEnhancers = composeWithDevToolsExtension;
        }
    }

    // ======================================================
    // Store Instantiation and HMR Setup
    // ======================================================
    const store = createStore(
      makeRootReducer(),
      initialState,
      composeEnhancers(
        applyMiddleware(...middleware),
        ...enhancers
      )
    );

    store.dispatch({ type: actions.JOIN, data: 'BTC-ETH' })

    return store;
};
