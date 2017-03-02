import { SCANNER_LOAD_INFO_PENDING,
  SCANNER_LOAD_INFO_SUCCESS,
  SCANNER_LOAD_INFO_ERROR,
  SCANNER_PRINT_CLIENT,
  SCANNER_STORE_PHONE,
  SCANNER_STORE_EXTENSION_ID,
  SCANNER_STORE_PORTS,
  LOGOUT_USER,
} from '../constants';
import { fromJS } from 'immutable';

const INITIAL_STATE = fromJS({
  contact: null,
  phone: '',
  extensionId: 'ianojeajhgmlpeboogaeajobngdnhlko',
  error: null,
  pending: false,
  ports: [],
});

function scannerReducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {

  case SCANNER_LOAD_INFO_PENDING:
    return state.update('pending', () => true );

  case SCANNER_LOAD_INFO_ERROR:
    return state.merge(fromJS({
      'contact': nullS,
      'error': action.payload,
      'pending': false,
    }));


  case SCANNER_LOAD_INFO_SUCCESS:
    return state.merge(fromJS({
      'contact': action.payload,
      'error': null,
      'pending': false,
    }));

  case SCANNER_STORE_PHONE:
    return state.update('phone', () => action.payload || '' );

  case SCANNER_STORE_EXTENSION_ID:
    return state.update('extensionId', () => action.payload || '' );

  case SCANNER_STORE_PORTS:
    return state.update('ports', () => fromJS(action.payload || []) );

  case SCANNER_PRINT_CLIENT:
    return state;

  case LOGOUT_USER:
    return state.merge(INITIAL_STATE);

  default:
    return state;
  }
}

export default scannerReducer;
