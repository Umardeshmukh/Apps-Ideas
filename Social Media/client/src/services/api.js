import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data)
};

export const circles = {
  create: (data) => API.post('/circles', data),
  getMyCircles: () => API.get('/circles/my-circles'),
  join: (inviteCode) => API.post(`/circles/join/${inviteCode}`),
  leave: (circleId) => API.delete(`/circles/${circleId}/leave`)
};

export const posts = {
  create: (data) => API.post('/posts', data),
  getCircleFeed: (circleId) => API.get(`/posts/circle/${circleId}`),
  like: (postId) => API.post(`/posts/${postId}/like`),
  comment: (postId, content) => API.post(`/posts/${postId}/comment`, { content }),
  delete: (postId) => API.delete(`/posts/${postId}`)
};

export default API;
