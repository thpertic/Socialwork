import api from './api';

export default {
  login(user) {
    return api().post('/auth/login', user);
  },
  signup(credentials) {
    return api().post('/auth/signup', credentials);
  },
  logout() {
    return api().get('/auth/logout');
  },
  session() {
    return api().get('/session');
  },
  getUser() {
    return api().get('/user');
  },
  getAnotherUser(id) {
    return api().get(`/user/${id}`);
  },
};
