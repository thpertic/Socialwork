<template>
  <div class="main">
    <div class="newPost">
      <table style="width: 100%;">
        <tr>
          <td colspan="2" style="float: left;">
            <strong><label for="content">New post</label></strong>
          </td>
        </tr>
        <tr>
          <td>
            <textarea
              placeholder="How is it going?"
              v-model="content"
              name="content"
              id="content"
              rows="10">
            </textarea>
          </td>
        </tr>
        <tr>
          <td>
            <button
              style="float: right;"
              v-on:click="submitPost()">
              Post
            </button>
          </td>
        </tr>
      </table>
    </div>
    <br>
    <div>
      <div v-for="post in posts" :key="post._id">
        <!-- The Post component is used to manage each post separately -->
        <Post :post=post></Post>
      </div>
    </div>
  </div>
</template>

<script>
import Post from '../components/Post';

import users from '../services/users';
import posts from '../services/posts';
import router from '../router/index';

export default {
  name: 'Home',
  components: {
    Post,
  },
  data() {
    return {
      content: '',
      posts: [],
    };
  },
  beforeCreate() {
    users.session()
      .then((res) => {
        if (!res.data.sessionInitialized) {
          router.replace('/login');
        }
      })
      .catch(() => {});
  },
  mounted() {
    this.getPosts();
  },
  methods: {
    async getPosts() {
      const res = await posts.fetchPosts();
      const newPosts = res.data.posts;
      for (let i = 0; i < newPosts.length; i += 1) {
        this.posts.push(newPosts[i]);
      }
      // TODO: Infite scroll?
    },
    submitPost() {
      if (this.content !== '') {
        posts.addPost({ content: this.content });
        this.content = '';
      }
    },
  },
};
</script>

<style scoped>
.main {
  width: 75%;
  float: center;
}

.newPost {
  border: 1px solid rgb(151, 151, 151);
  width: 85%;
  padding: 10px;
}

textarea {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  resize: none;
  width: 100%;
}
</style>
