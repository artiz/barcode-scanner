import { SCANNER_LOAD_INFO_PENDING, SCANNER_LOAD_INFO_SUCCESS, SCANNER_LOAD_INFO_ERROR,
         SCANNER_PRINT_CLIENT,
         SCANNER_STORE_PHONE,
         SCANNER_STORE_EXTENSION_ID,
         SCANNER_STORE_PORTS } from '../constants';
import { findByPhone } from '../api/client/';

export function loadClient() {
  return (dispatch, getState) => {
    const phone = getState().scanner.get('phone') || '';

    if (!phone) {
      // TODO: validate
      // return dispatch
    }

    return dispatch({
      types: [
        SCANNER_LOAD_INFO_PENDING,
        SCANNER_LOAD_INFO_SUCCESS,
        SCANNER_LOAD_INFO_ERROR,
      ],
      payload: {
        promise: findByPhone(phone)
          .then((res) => {
            // dispatch({
            //   type: SCANNER_LOAD_INFO_SUCCESS,
            //   payload: res,
            // });
            return res;
          }),
      },
    });
  };
}

export function printInfo() {
  window.print();
  return {
    type: SCANNER_PRINT_CLIENT,
  };
}


export function storePhone(phone) {
  return {
    type: SCANNER_STORE_PHONE,
    payload: phone,
  };
}

export function storeExtensionId(id) {
  return {
    type: SCANNER_STORE_EXTENSION_ID,
    payload: id,
  };
}

export function storePorts(ports) {
  return {
    type: SCANNER_STORE_PORTS,
    payload: ports,
  };
}

