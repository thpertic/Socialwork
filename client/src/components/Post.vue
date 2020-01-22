<template>
  <div>
    <table class="post">
      <tr>
        <td colspan='2' style="float: left;">
          <!-- TODO: Link directly to /dashboard (user info), but how to know the user to request? -->
          <a v-on:click="goToUser(post.user[0]._id)">
            <strong>{{ post.user[0].username }}</strong>
          </a>
        </td>
      </tr>
      <tr>
        <td colspan='2' style="padding-top: 1%; padding-bottom: 2%;">
          {{ post.content }}
        </td>
      </tr>
      <tr>
        <td>
          <a v-on:click="addVote('upvote')" v-bind:class="{ upvoted: upvoted, unvoted: !upvoted }">++</a>
          {{ post.upvotes }}
        </td>
        <td>
          <a v-on:click="addVote('downvote')" v-bind:class="{ downvoted: downvoted, unvoted: !downvoted }">--</a>
          {{ post.downvotes }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import posts from '../services/posts';
import users from '../services/users';

export default {
  name: 'Post',
  props: ['post'],
  data() {
    return {
      upvoted: false,
      downvoted: false,
      user: undefined,
    };
  },
  mounted() {
    this.updateVotes();
  },
  methods: {
    async updateVotes() {
      const res = await users.getUser();
      this.user = res.data;

      // Check if this post was upvoted, if not check if it was downvoted
      var upvote = this.user.upvotes.find((element) => {
        return element === this.post._id;
      });
      if (upvote) 
        this.upvoted = true;
      else {
        var downvote = this.user.downvotes.find((element) => {
          return element === this.post._id;
        });
        if (downvote)
          this.downvoted = true;
      }
    },
    addVote(typeOfVote) {
      switch (typeOfVote) {
        case ('upvote'):
          if (this.upvoted) {
            // Already upvoted: unvote
            this.post.upvotes -= 1;
            this.upvoted = false;
          } else {
            this.post.upvotes += 1;
            this.upvoted = true;

            if (this.downvoted) {
              // If it was downvoted, remove it
              this.post.downvotes -= 1;
              this.downvoted = false;
            }
          }
          break;

        case ('downvote'):
          if (this.downvoted) {
            // Already downvoted: unvote
            this.post.downvotes -= 1;
            this.downvoted = false;
          } else {
            this.post.downvotes += 1;
            this.downvoted = true;

            if (this.upvoted) {
              // If it was upvoted, remove it
              this.post.upvotes -= 1;
              this.upvoted = false;
            }
          }
          break;
      }
      // Saving everything into the database
      posts.updatePost(this.post._id,
        {
          content: this.post.content,
          upvotes: this.post.upvotes,
          downvotes: this.post.downvotes,
        });
      // TODO: What if the user refreshes the page? He will be able to revote without affecting the other one.
      // TODO: The user needs to have a list of _ids which are the upvoted/downvoted posts
    },
  },
};
</script>

<style scoped>
.post {
  border: 1px solid rgb(200, 200, 200);
  width: 100%;
  margin: 7px;
  padding: 5px;
}

.upvoted {
  color: rgb(253, 30, 0);
  font-weight: bold;
  cursor: pointer;
}

.downvoted {
  color: rgb(0, 80, 255);
  font-weight: bold;
  cursor: pointer;
}

.unvoted {
  color: black;
  font-weight: normal;
  cursor: pointer;
}
</style>
