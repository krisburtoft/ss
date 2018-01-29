import React, { Component } from 'react';
import PropTypes from 'prop-types';
const loader = require('images/loader.svg');
import './LoadingIndicator.less';

const LoadingIndicatorComponent = ({ className = '' }) => {
    return (
        <img src={`data:image/svg+xml;utf8,${loader}`} className={`loading-indicator ${className}`} />
    );
}

export default LoadingIndicatorComponent;
