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
        const { rows, pageIndex, totalPages, title } = this.props;
        return (
            <div className='book__wrapper'>
                <h2 className='book__title'>{rows.length ? title : `Loading ${title}...`}</h2>
                <div className='book__header book__row'>
                    <div className='book__row-rate'>
                        Rate
                    </div>
                    <div className='book__row-quantity'>
                        Quantity
                    </div>
                    <div className='book__row-exchanges'>
                        Exchanges
                    </div>
                    <div classNam='book__row-multiple-exchanges'>
                    </div>
                </div>
                <div className='book__rows'>
                    {rows.map((row, index) => (
                            <div
                                className={`book__row book__row--${
                                    index % 2 === 0 ? 'even' : 'odd'
                                    } ${row.exchange.length > 1 ? 'book__row--overlapping' : ''}`}
                                key={row.rate}>
                                <div className='book__row-rate'>
                                    {row.rate}
                                </div>
                                <div className='book__row-quantity'>
                                    {row.quantity}
                                </div>
                                <div className='book__row-exchanges'>
                                    {row.exchange.join(', ')}
                                </div>
                                <div className='book__row-multiple-exchanges'>
                                    <span />
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
