import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
//import reducers here
import filesReducer from '../reducers/filesReducer';
import appstateReducer from '../reducers/appstateReducer';
//import thunk from 'redux-thunk' if needed
import thunk from 'redux-thunk';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
    const store = createStore(
        combineReducers({
            files:filesReducer,
            appstate:appstateReducer
        }), {appstate: {flaskProcessing:false}},composeEnhancers(applyMiddleware(thunk))
    );
    return store;
}