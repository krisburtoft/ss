

import React, { Component } from 'react';
import Book from '../../components/Book';
import MarketCard from '../../components/MarketCard';

import './OrderBooks.less';

export default class OrderBooksRoute extends Component {
    componentWillMount() {
        this.props.loadMarket(this.props.match.params.market);
    }
    componentWillUnmount() {
        this.props.unsubscribe(this.props.match.params.market);
    }
    render() {
        const {
            changePage,
            asks,
            asksPageIndex,
            asksTotalPages,
            bids,
            bidsPageIndex,
            bidsTotalPages,
            marketSummary
        } = this.props;
        return (
            <div className='home-route'>
                <div className='home-route__market-summary'>
                    <h1 className='home-route__market-summary-title'>{marketSummary.name}</h1>
                    <MarketCard {...marketSummary} />
                </div>
                <div className='home-route__book'>
                    <Book
                        changePage={changePage}
                        pageIndex={asksPageIndex}
                        rows={asks}
                        title='Asks'
                        totalPages={asksTotalPages}
                        listType='asks' />
                </div>
                <div className='home-route__book'>
                    <Book
                        changePage={changePage}
                        pageIndex={bidsPageIndex}
                        rows={bids}
                        title='Bids'
                        totalPages={bidsTotalPages}
                        listType='bids' />
                </div>
            </div>
        );
    }
}