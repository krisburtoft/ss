import Immutable from 'seamless-immutable';
import actions from 'shared/actions.json';
import _ from 'lodash';

export const name = 'orderBook';
const  CHANGE_PAGE = '@@order-books/CHANGE_PAGE';
const PAGE_SIZE = 10;
// ------------------------------------
// Selectors
// ------------------------------------
export const getOrderBookState = state => _.get(state, name, initialState);
// ------------------------------------
// Actions
// ------------------------------------

export const changePage = (pageIndex, list) => ({
    type: CHANGE_PAGE,
    payload: {
        list,
        pageIndex
    }
});

export const loadMarket = (data) => {
    return (dispatch, getState) => {
        dispatch({
            type: actions.JOIN,
            data
        });
        dispatch({
            type: actions.GET_MARKET_INFO,
            data
        });

    }
};

export const unsubscribe = (data) => ({
    type: actions.UNSUBSCRIBE,
    data
})

// ------------------------------------
// Helpers
// ------------------------------------

const pageList = (list, pageIndex) => {
    return list.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
    [actions.ORDERBOOKS]: (state, action) =>  {
        const { bids, asks } = action.payload;
        const { asksPageIndex, bidsPageIndex } = state;
        return state.set('orderBook', action.payload)
                    .set('asks', pageList(asks, asksPageIndex))
                    .set('bids', pageList(bids, bidsPageIndex))
                    .set('asksTotalPages', Math.ceil(asks.length / PAGE_SIZE))
                    .set('bidsTotalPages', Math.ceil(bids.length / PAGE_SIZE));
    },
    [CHANGE_PAGE]: (state, action) => {
        const { list, pageIndex } = action.payload;
        const targetList = state.orderBook[list].asMutable();
        const currentPage = targetList.slice(pageIndex * PAGE_SIZE, (pageIndex  + 1) * PAGE_SIZE);
        const totalPages = Math.ceil(targetList.length / PAGE_SIZE);
        return state.set(list, currentPage)
            .set(`${list}PageIndex`, pageIndex)
            .set(`${list}TotalPages`, totalPages)
    },
    [actions.UNSUBSCRIBE]: (state, action) => initialState,
    [actions.RECEIVE_MARKET_INFO]: (state, action) => state.set('marketSummary', action.payload).set('loading', false)
};

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = Immutable.from({
    orderBook: {},
    asks: [],
    bids: [],
    asksPageIndex: 0,
    bidsPageIndex: 0,
    asksTotalPages: 0,
    bidsTotalPages: 0,
    marketSummary: {},
    loading: true
});

export default function orderBooksReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type];

    return handler ? handler(state, action) : state;
}
