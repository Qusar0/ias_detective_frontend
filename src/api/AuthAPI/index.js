import { defaultAPIInstance, loginAPIInstance } from '..';

export const AuthAPI = {
  login(login, password) {
    const url = '/login';
    const data = {login, password};
    return loginAPIInstance.post(url, data);
  },
  logout() {
    const url = '/logout';
    return defaultAPIInstance.post(url);
  }
};