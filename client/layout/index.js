import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom'
import { Home } from 'routes';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import  './layout.less';

export default class LayOutComponent extends React.Component {
   
    render() {
        return (
            <BrowserRouter>
                <div className='core-layout__wrapper'>
                    <div className='core-layout__header'>
                    </div>
                    <div className='core-layout__content'>
                        <Route exact path="/" component={Home} />
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}


