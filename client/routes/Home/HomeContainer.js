import Home from './HomeComponent';
import { connect } from 'react-redux';
import { loadMarkets, getHomeState } from '../../store/reducers/homeReducer';

const mapActionCreators = {
    loadMarkets
}

export default connect(getHomeState, mapActionCreators)(Home);