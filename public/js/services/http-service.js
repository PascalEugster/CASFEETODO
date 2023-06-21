import { valueStorage } from './value-storage.js';

const tokenKey = 'token';

class HttpService {
  ajax(method, url, data, headers) {
    const fetchHeaders = new Headers({
      'content-type': 'application/json',
      ...(headers || {}),
    });

    if (valueStorage.getItem(tokenKey)) {
      fetchHeaders.append(
        'authorization',
        'Bearer ' + valueStorage.getItem(tokenKey)
      );
    }

    return fetch(url, {
      method: method,
      headers: fetchHeaders,
      body: JSON.stringify(data),
    }).then((x) => {
      return x.json();
    });
  }

  setAuthToken(token) {
    valueStorage.setItem(tokenKey, token);
  }

  hasAuthToken() {
    return Boolean(valueStorage.getItem(tokenKey));
  }

  removeAuthToken(token) {
    valueStorage.setItem(tokenKey, undefined);
  }

  getSortKey(sortMethod) {
    let prefix = 'sortMethod_';
    let sortKey = prefix + sortMethod;
    return sortKey;
  }

  setSortStatus(sortMethod) {
    let sortKey = this.getSortKey(sortMethod);
    let sortBy = valueStorage.getItem(sortKey);
    if (sortBy === null || sortBy === 'asc') {
      sortBy = 'desc';
    } else {
      sortBy = 'asc';
    }
    return valueStorage.setItem(sortKey, sortBy);
  }

  getSortStatus(sortMethod) {
    let sortKey = this.getSortKey(sortMethod);
    return valueStorage.getItem(sortKey);
  }

  setDarkMode(darkMode) {
    valueStorage.setItem('darkMode', darkMode);
  }

  getDarkMode() {
    return valueStorage.getItem('darkMode') || 0;
  }
}

export const httpService = new HttpService();
