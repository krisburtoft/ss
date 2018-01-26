import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './MarketCard.less';

class MarketCardComponent extends Component {
    render() {
        const { id, logoUrl, name, baseCurrency } = this.props;
        return (
            <Link to={`/${id}`} className='market-card'>
              <h2>{name}</h2>
              { 
                  logoUrl &&
                  <img src={logoUrl} alt={name} className='market-card__logo'/>
              }
              <span className='market-card__base-currency'>
                Base Currency: {baseCurrency}
              </span>
            </Link>
        );
    }
}

MarketCardComponent.propTypes = {
    logoUrl: PropTypes.string,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    baseCurreency: PropTypes.string.isRequired
};

export default MarketCardComponent;