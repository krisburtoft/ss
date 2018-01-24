import Immutable from 'seamless-immutable';
import actions from 'shared/actions.json';
import _ from 'lodash';

export const name = 'orderBook';

// ------------------------------------
// Selectors
// ------------------------------------
export const getOrderBookState = state => _.get(state, name, initialState);
// ------------------------------------
// Actions
// ------------------------------------

// ------------------------------------
// Action Handlers
// ------------------------------------

const ACTION_HANDLERS = {
    [actions.CHUNK]: (state, action) =>  state.set('orderBook', action.payload)
};

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = Immutable.from({
    orderBook: []
});

export default function uiContextReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type];

    return handler ? handler(state, action) : state;
}

