import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MarketCard from 'components/MarketCard';
import LoadingIndicator from 'components/LoadingIndicator';

import './Home.less';

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
                { loading && 
                    <LoadingIndicator className='home-route__loading' />
                }
                {
                    this.props.markets.map(m => 
                        <MarketCard key={m.id} {...m} />
                    )
                }
            </div>
        );
    }
}

HomeRoute.propTypes = {
    markets: PropTypes.arrayOf(PropTypes.shape(MarketCard.propTypes)),
    loading: PropTypes.bool.isRequired
};

export default HomeRoute;
