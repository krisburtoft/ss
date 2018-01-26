import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MarketCard from '../../components/MarketCard';

class HomeRoute extends Component {
    componentWillMount() {
        if (!this.props.markets.length) {
            this.props.loadMarkets();
        }
    }
    render() {
        return (
            <div>
                {this.props.markets.map(m => <MarketCard key={m.id} {...m} />)}
            </div>
        );
    }
}

HomeRoute.propTypes = {
    markets: PropTypes.arrayOf(MarketCard.propTypes),
};

export default HomeRoute;