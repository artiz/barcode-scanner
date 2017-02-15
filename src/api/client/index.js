import { get } from '../server/';

const FIND_CLIENT_ERR_MSG = 'Client not found';

export function findByPhone(phone) {
  return new Promise((resolve, reject) => {
    return get('/client/find?phone=' + encodeURIComponent(phone))
    .then(json => resolve(json.meta))
    .then(null, () => reject(new Error(FIND_CLIENT_ERR_MSG)));
  });
}
