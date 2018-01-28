const ExchangeSubscriptionManager = require('../../server/order-books/ExchangeSubscriptionManager');

describe('ExchangeSubscriptionManager', () => {
    describe('default state', () => {
        let manager;
        beforeEach(() => {
            manager = new ExchangeSubscriptionManager();
        });
        it('should have empty registeredPairs', () => {
            expect(manager.registeredPairs).to.deep.equal({});
        });
        it('should have no registered exchanges', () => {
            expect(manager.registeredExchanges.length).to.equal(0);
        });
    });

    describe('registerExchangeManager', () => {
        let manager;
        let exchangeImplementation;
        let getManager;
        beforeEach(() => {
            manager = new ExchangeSubscriptionManager();
            exchangeImplementation = {
                name: 'mockexchange',
                subscribe: () => {},
                unsubscribe: () => {}
            };
            getManager = () => exchangeImplementation;
        });
        it('should require name', () => {
            delete exchangeImplementation.name
            expect(() => manager.registerExchangeManager(getManager)).to.throw;
        });
        it('should require subscribe', () => {
            delete exchangeImplementation.subscribe;
            expect(() => manager.registerExchangeManager(getManager))
        });
        it('should require unsubscribe', () => {
            delete exchangeImplementation.subscribe;
            expect(() => manager.registerExchangeManager(getManager))
        });
        it('should populate the registered exchange managers', () => {
            manager.registerExchangeManager(getManager);
            expect(manager.registeredExchanges[0]).to.equal(exchangeImplementation)
        });
    });

    describe('subscribeToCurrencyPair', () => {
        let manager;
        let exchangeImplementation;
        let getManager;
        let mockBooks;
        beforeEach(() => {
            manager = new ExchangeSubscriptionManager();
            exchangeImplementation = {
                name: 'mockexchange',
                subscribe: () => {},
                unsubscribe: () => {}
            };
            getManager = () => exchangeImplementation;
            manager.registerExchangeManager(getManager);
        });

        it('should call subscribe on the exchange implementation', () => {
            sinon.spy(exchangeImplementation, 'subscribe');
            manager.subscribeToCurrencyPair('ETC', getManager);
            expect(exchangeImplementation.subscribe.calledOnce).to.be.true;
        })

        it('call should pipe the data to the callback.', () => {
            const spy = sinon.spy();
            manager.subscribeToCurrencyPair('ETC', spy);
            expect(spy.calledOnce).to.be.true;
        });

    });

    describe('unsubscribe', () => {
        let manager;
        let exchangeImplementation;
        let getManager;
        let mockBooks;
        let mockCallback;
        let unsubscribe;
        beforeEach(() => {
            manager = new ExchangeSubscriptionManager({
                throttleTime: 0
            });
            mockBooks = {
                asks: [],
                bids: []
            };
            exchangeImplementation = {
                name: 'mockexchange',
                subscribe: (pair, cb) => {
                    cb(mockBooks);
                    const intervalId = setInterval(() => cb(mockBooks), 100);
                    setTimeout(() => clearInterval(intervalId), 301)
                },
                unsubscribe: () => {}
            };
            getManager = () => exchangeImplementation;
            mockCallback = sinon.spy();
            manager.registerExchangeManager(getManager);
            unsubscribe = manager.subscribeToCurrencyPair('ETC', mockCallback);
        });

        it('sanity check', done => {
            setTimeout(() => {
                manager.unsubscribe();
                expect(mockCallback.callCount).to.equal(3);
                done();
            }, 400);
        });

        it('halt the piping of data to client', done => {
            unsubscribe();
            setTimeout(() => {
                expect(mockCallback.callCount).to.equal(1);
                done();
            }, 400);
        });
    });
});
