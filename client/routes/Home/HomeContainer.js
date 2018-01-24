import { connect } from 'react-redux';
import HomeComponent from './HomeComponent';
import { getOrderBookState } from 'store/reducers/orderBookReducer';

export default connect(getOrderBookState)(HomeComponent);
