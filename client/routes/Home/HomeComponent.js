import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MarketCard from '../../components/MarketCard';
import './Home.less';
const loader = require('images/loader.svg');

class HomeRoute extends Component {
    componentWillMount() {
        if (!this.props.markets.length) {
            this.props.loadMarkets();
        }
    }
    render() {
        const { loading, markets } = this.props;
        return (
            <div className='home-route'>
                {
                    loading &&
                    <img src={`data:image/svg+xml;utf8,${loader}`} className='home-route__loading' />
                }
                {this.props.markets.map(m => <MarketCard key={m.id} {...m} />)}
            </div>
        );
    }
}

HomeRoute.propTypes = {
    markets: PropTypes.arrayOf(PropTypes.shape(MarketCard.propTypes)),
    loading: PropTypes.bool.isRequired
};

export default HomeRoute;
