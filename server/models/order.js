module.exports = class Order {
    constructor( { type, market, rate, amount, Rate, Quantity } ) {
        this.market = market;
        this.type = type;
        this.rate = Rate || parseFloat( rate );
        this.amount = Quantity || parseFloat( amount );
    }
};
