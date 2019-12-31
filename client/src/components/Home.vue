<template>
    <div>
        This is the home.
    </div>
</template>

<script>
import users from '../services/users';
import router from '../router/index';

export default {
  name: 'Home',
  beforeCreate() {
    users.session()
      .then((res) => {
        if (!res.data.sessionInitialized) {
          router.replace('/login');
        }
      })
      .catch(() => {});
  },
};
</script>
