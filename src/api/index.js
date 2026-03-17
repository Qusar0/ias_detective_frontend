import axios from 'axios';

const loginConfig = {
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  }
};
export const loginAPIInstance = axios.create(loginConfig);

const defaultConfig = {
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  }
};

export const defaultAPIInstance = axios.create(defaultConfig);