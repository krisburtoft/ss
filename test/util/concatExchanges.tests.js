const utility = require('../../server/util/concatExchanges');
describe('concatExchanges', () => {
    describe('concatList', () => {
        let lists = [{
            asks: [{
                rate: 1,
                quantity: 2,
                exchange: ['a']
            }],
            bids: [{
                rate: 1.3,
                quantity: 2,
                exchange: ['a']
            }]
        },{
            asks: [{
                rate: 1,
                quantity: 2,
                exchange: ['b']
            }],
            bids: [{
                rate: 1.2,
                quantity: 2,
                exchange: ['a']
            }]
        }];
        let result;
        beforeEach(() => {
            result = utility.concatExchanges(lists);
        });

        it('should return a single object with asks property', () => {
            expect(result).to.have.property('asks');
        });
        it('should return a single object with bids property', () => {
            expect(result).to.have.property('bids');
        });
        it('should combine asks with same rate', () => {
            expect(result.asks.map(a => a.rate)).to.deep.equal([1])
        });
        it('should combine the quantity of duplicate rate items', () => {
            expect(result.asks[0].quantity).to.equal(4);
        });
        it('should concat the exchanges to a single array', () => {
            expect(result.asks[0].exchange).to.deep.equal(['a','b']);
        });
    });

    describe('combineAndSort', () => {
        let asks
        let result;
        let reversed;
        beforeEach(() => {
            asks = [{
                rate: 1.2342,
                quantity: 2,
                exchange: ['b']
            },{
                rate: 1.4234,
                quantity: 2,
                exchange: ['a']
            }];
            result = utility.combineAndSort(asks);
            reversed = utility.combineAndSort(asks, true);
        });

        it('should keep distinct items (by rate) intact', () => {
            expect(result.length).to.equal(2);
        });

        it('should order ascending if reverse is not set to true', () => {
            expect(result[0]).to.deep.equal(asks[0])
        });

        it('should order descending if reverse is set to true', () => {
            expect(reversed[0]).to.deep.equal(asks[1])
        });

    });

});
