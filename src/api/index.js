import axios from 'axios';
import router from '../router';

const DOMAIN = 'http://localhost:3000';
const UNAUTHORIZED = 401;
const onUnauthorized = () => {
  router.push(`/login?rPath=${encodeURIComponent(location.pathname)}`).catch(() => {});
}

const request = (method, url, data) => {
  return axios({
    method,
    url: DOMAIN + url,
    data,
  }).then(({data}) => data)
    .catch(({response}) => {
      const {status} = response;
      if (status === UNAUTHORIZED) onUnauthorized();
      throw response;
    })
};

export const setAuthInHeader = token => {
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : null;
}

export const Board = {
  fetch(id) {
    return id ? request('get', `/boards/${id}`) : request('get', '/boards');
  },
  create(title) {
    return request('post', '/boards', {title});
  },
  update(id, payload) {
    return request('put', `/boards/${id}`,payload);
  },
  destroy(id) {
    return request('delete', `/boards/${id}`);
  },
};

export const Auth = {
  login(email, password) {
    return request('post', '/login', {email, password});
  },
};

export const List = {
  create(payload) {
    return request('post', '/lists', payload);
  },
  update(id, payload) {
    return request('put', `/lists/${id}`, payload);
  },
};

export const Card = {
  create(title, listId, pos) {
    return request('post', '/cards', {title, listId, pos})
  },
  fetch(id) {
    return request('get', `/cards/${id}`);
  },
  update(id, payload) {
    return request('put', `/cards/${id}`,payload);
  },
  destroy(id) {
    return request('delete', `/cards/${id}`);
  },
};
