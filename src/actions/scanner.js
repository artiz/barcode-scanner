import { SCANNER_LOAD_INFO_PENDING, SCANNER_LOAD_INFO_SUCCESS, SCANNER_LOAD_INFO_ERROR,
         SCANNER_PRINT_CLIENT } from '../constants';
import { findByPhone } from '../api/client/';

export function loadInfo() {
  return (dispatch, getState) => {
    const phone = getState().form.phone.value;

    return dispatch({
      types: [
        SCANNER_LOAD_INFO_PENDING,
        SCANNER_LOAD_INFO_SUCCESS,
        SCANNER_LOAD_INFO_ERROR,
      ],
      payload: {
        promise: findByPhone(phone)
          .then((res) => {
            return res;
          }),
      },
    });
  };
}

export function print() {
  console.log('print');
  return {
    type: SCANNER_PRINT_CLIENT,
  };
}
