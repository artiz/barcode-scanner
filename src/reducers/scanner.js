import { SCANNER_LOAD_INFO_PENDING,
  SCANNER_LOAD_INFO_SUCCESS,
  SCANNER_LOAD_INFO_ERROR,
  SCANNER_PRINT_CLIENT, LOGOUT_USER } from '../constants';
import { fromJS } from 'immutable';

const INITIAL_STATE = fromJS({
  clientInfo: null,
  error: null,
  pending: false,
});

function scannerReducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {

  case SCANNER_LOAD_INFO_PENDING:
    return state.update('pending', true);

  case SCANNER_LOAD_INFO_ERROR:
    return state.update({
      'clientInfo': {},
      'error': action.payload,
      'pending': false,
    });

  case SCANNER_LOAD_INFO_SUCCESS:
    return state.update({
      'clientInfo': action.payload,
      'error': null,
      'pending': false,
    });

  case SCANNER_PRINT_CLIENT:
    return state;

  case LOGOUT_USER:
    return state.merge(INITIAL_STATE);

  default:
    return state;
  }
}

export default scannerReducer;
