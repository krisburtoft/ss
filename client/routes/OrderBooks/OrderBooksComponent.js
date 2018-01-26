

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
                    {/* <h1>{marketSummary.name}</h1>
                    <span className='home-route__market-summary-base-currency'>
                        Base Currency: {marketSummary.baseCurrency}
                    </span>
                    {
                        marketSummary.logoUrl &&
                        <img src={marketSummary.logoUrl} alt={marketSummary.name} />
                    } */}
                    <h1>{marketSummary.name}</h1>
                    <MarketCard {...marketSummary} />
                </div>
                <div className='home-route__book'>
                    <h1>Asks</h1>
                    <Book
                        changePage={changePage}
                        pageIndex={asksPageIndex}
                        rows={asks}
                        totalPages={asksTotalPages}
                        listType='asks' />
                </div>
                <div className='home-route__book'>
                    <h1>Bids</h1>
                    <Book
                        changePage={changePage}
                        pageIndex={bidsPageIndex}
                        rows={bids}
                        totalPages={bidsTotalPages}
                        listType='bids' />
                </div>
            </div>
        );
    }
}