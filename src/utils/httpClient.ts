import axios from 'axios';

const baseURL = 'http://localhost:9000';
const httpClient = axios.create({
  baseURL,
  timeout: 5000,
  withCredentials: true, // 允许跨域 cookie
  headers: {'X-Requested-With': 'XMLHttpRequest'}
});

httpClient.interceptors.response.use(result => {
  if (result.data.code !== 200) {
    throw new Error(result.data.message);
  } else {
    return result.data.data;
  }
});

export const sendSms = (data: { phoneNumber: string }) => {
  return httpClient({
    method: 'POST', 
    url: '/api/user/getSmsCode', 
    data,
  });
};

export const signUp = (data: {
  username: string,
  password: string,
  smsCode: string,
}) => {
  return httpClient({
    method: 'POST', 
    url: 'api/user/signUp', 
    data,
  });
};

export const signIn = (data: {
  username: string,
  password: string,
}) => {
  return httpClient({
    method: 'POST', 
    url: 'api/user/signIn', 
    data,
  });
};

export const resetPassword = (data: {
  username: string,
  password: string,
  smsCode: string,
}) => {
  return httpClient({
    method: 'POST', 
    url: 'api/user/resetPassword', 
    data,
  });
};