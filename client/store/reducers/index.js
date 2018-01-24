import { combineReducers } from 'redux';


export const makeRootReducer = (asyncReducers) => {
    const r = require.context('./', true, /reducer\.js$/i);
    const reducers = r.keys().reduce((reducers, f) => {
        const required = r(f);
        if (!required.name) {
            throw Error('each reducer must export a name property', f);
        }
        reducers[required.name] = required.default;
        return reducers;
    }, {});
    console.log('reducers', reducers)
    return combineReducers(reducers);
};