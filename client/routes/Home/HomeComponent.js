

    import React, { Component } from 'react';
    import './Home.less';
    
    export default class HomeRoute extends Component {
        render() {
            return (
                <div className='home-route'>
                  {JSON.stringify(this.props)}
                </div>
            );
        }
    }