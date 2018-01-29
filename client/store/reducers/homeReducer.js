import Immutable from 'seamless-immutable';
import actions from 'shared/actions.json';
import _ from 'lodash';

export const name = 'home';
// ------------------------------------
// Selectors
// ------------------------------------
export const getHomeState = state => _.get(state, name, initialState);

// ------------------------------------
// Actions
// ------------------------------------
export const loadMarkets = (data) => ({
    type: actions.LOAD_MARKETS,
    data
});

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
    [actions.RECEIVE_MARKETS]: (state, action) =>  {
        return state.set('markets', action.payload).set('loading', false);
    }
};

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = Immutable.from({
    markets: [],
    loading: true
});

export default function homeReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type];

    return handler ? handler(state, action) : state;
}
