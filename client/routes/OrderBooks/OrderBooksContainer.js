import { connect } from 'react-redux';
import OrderBooksComponent from './OrderBooksComponent';
import {
    getOrderBookState,
    changePage,
    loadMarket,
    unsubscribe
} from 'store/reducers/orderBookReducer';

const actionCreators = {
    changePage,
    loadMarket,
    unsubscribe
};

export default connect(getOrderBookState, actionCreators)(OrderBooksComponent);
