<template>
  <div>
    <div><p style="font-weight:bold">Sign up here.</p></div><br><br>
      <table>
        <tr>
          <td class="labels"><label for="email">Email</label></td>
          <td><input
                v-model="user.email"
                type="email"
                id="email"
                required></td>
        </tr>

        <tr>
            <td class="labels"><label for="username">Username</label></td>
            <td><input
                v-model="user.username"
                type="text"
                id="username"
                required></td>
        </tr>
        <tr>
            <td class="labels"><label for="password">Password</label></td>
            <td><input
                v-model="user.password"
                type="password"
                id="password" required></td>
        </tr>

        <tr v-if="visible">
          <td colspan="3">
            <p style="color: red; font-size: 13px;">{{ message }}</p>
          </td>
        </tr>

        <tr>
            <td colspan="3" class="btnSubmit">
              <button type="submit" v-on:click='signup'>Sign up</button>
            </td>
        </tr>
        <br>
        <tr>
          <td colspan="3">
            <p style="font-size: 12px">
              Already have an account?
              Log in <a href="/login">here</a>
            </p>
          </td>
        </tr>
      </table>
  </div>
</template>

<script>
import users from '../services/users';
import router from '../router/index';

export default {
  name: 'Signup',
  data() {
    return {
      user: {
        email: '',
        username: '',
        password: '',
      },
      visible: false,
      message: '',
    };
  },
  beforeCreate() {
    users.session()
      .then((res) => {
        if (res.data.sessionInitialized) {
          router.replace('/');
        }
      })
      .catch(() => {});
  },
  methods: {
    signup(e) {
      e.preventDefault();

      users.signup(this.user)
        .then((res) => {
          if (res.data.success) {
            // Everything's fine
            router.replace('/');
          } else {
            // Show a kind of notification with some error message
            this.message = res.data.message;
            this.visible = true;
          }
        })
        .catch((ex) => {
          this.message = ex;
          this.visible = true;
        });
    },
  },
};
</script>
