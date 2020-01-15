import api from './api';

export default {
  fetchPosts() {
    return api().get('/posts');
  },
  addPost(content) {
    return api().post('/post', content);
  },
  updatePost(id, content) {
    return api().put(`/post/${id}`, content);
  },
};
