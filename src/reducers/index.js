import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import counter from './counter';
import scanner from './scanner';
import session from './session';

const rootReducer = combineReducers({
  session,
  counter,
  scanner,
  routing: routerReducer,
  form: formReducer,
});

export default rootReducer;
