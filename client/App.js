import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom'
import { OrderBooks, Home } from 'routes';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import  './App.less';

export default class AppComponent extends React.Component {
   
    render() {
        return (
            <BrowserRouter>
                <div className='core-layout__wrapper'>
                    <div className='core-layout__header'>
                    </div>
                    <div className='core-layout__content'>
                        <Route path="/" exact component={Home} />
                        <Route path="/:market" exact component={OrderBooks} />
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}


