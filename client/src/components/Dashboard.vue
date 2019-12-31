<template>
  <div>
    <div>
      <h2 style="font-weight:bold">Dashboard</h2>
      <p>This is the profile page.</p>
    </div>
    <br>
    <div v-if="visible">
      <table>
        <tr>
          <td class="labels"><strong>Username</strong>:</td>
          <td class="infos">{{user.username}}</td>
        </tr>
        <tr>
          <td class="labels"><strong>Email</strong>:</td>
          <td class="infos">{{user.email}}</td>
        </tr>
      </table>
    </div>
    <div v-if="!visible">
      <p id="error">There has been an error retrieving your informations.</p>
    </div>
    <br>
    <div>
      <a id="logout" v-on:click='logout'>Logout</a>
    </div>
  </div>
</template>

<script>
import users from '../services/users';
import router from '../router/index';

export default {
  name: 'Dashboard',
  data() {
    return {
      user: {
        username: '',
        email: '',
      },
      visible: true,
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
    this.getUser();
  },
  methods: {
    async getUser() {
      try {
        const res = await users.getUser();

        if (res.data.username && res.data.email) {
          this.user.username = res.data.username;
          this.user.email = res.data.email;
        }
      } catch (e) {
        this.visible = false;
      }
    },
    logout() {
      users.logout()
        .then((res) => {
          if (res.data.success) {
            router.replace('/login');
          }
          // TODO: If the logout isn't successful?
        });
    },
  },
};
</script>

<style scoped>
#logout {
  font-size:13px;
  text-decoration: underline;
  cursor: pointer;
}

.infos {
  float:right;
}
.labels {
  float: left;
}

#error {
  color: red;
  font-weight: bold;
}
</style>
