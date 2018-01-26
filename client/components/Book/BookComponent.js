import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Pager from 'react-pager';
import './Book.less';

class BookComponent extends Component {
    constructor(props) {
        super(props);
        this.navigate = this.navigate.bind(this);
    }

    navigate(index) {
        this.props.changePage(index, this.props.listType);
    }

    render() {
        const { rows, pageIndex, totalPages } = this.props;
        return (
            <div className='book__wrapper'>
                <div className='book__header book__row'>
                    <div className='book__row-rate'>
                        Rate
                    </div>
                    <div className='book__row-quantity'>
                        Quantity
                    </div>
                    <div className='book__row-exchanges'>
                        Exchange
                    </div>
                </div>
                <div className='book__rows'>
                    {rows.map((row, index) => (
                            <div 
                                className={`book__row book__row--${
                                    index % 2 === 0 ? 'even' : 'odd'
                                    } ${row.exchange === 'both' ? 'book__row--overlapping' : ''}`} 
                                key={row.rate}>
                                <div className='book__row-rate'>
                                    {row.rate}
                                </div>
                                <div className='book__row-quantity'>
                                    {row.quantity}
                                </div>
                                <div className='book__row-exchanges'>
                                    {row.exchange}
                                </div>
                            </div>
                        )
                    )}
                </div>
                <div className='book__nav'>
                    <Pager
                        total={totalPages}
                        current={pageIndex}
                        visiblePages={8}
                        titles={{ first: '1', last: totalPages, next: ' ', prev: ' ' }}
                        onPageChanged={this.navigate} />

                </div>
            </div>
        );
    }
}

BookComponent.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.shape({
      exchange: PropTypes.string.isRequired
    })).isRequired,
    changePage: PropTypes.func.isRequired,
    pageIndex: PropTypes.number.isRequired,
    listType: PropTypes.string.isRequired,
    totalPages: PropTypes.number.isRequired
};

export default BookComponent;