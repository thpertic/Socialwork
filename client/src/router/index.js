import Vue from 'vue';
import Router from 'vue-router';

import Login from '@/components/Login';
import Signup from '@/components/Signup';
import PersonalDashboard from '@/components/PersonalDashboard';
import Home from '@/components/Home';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/personaldashboard',
      name: 'PersonalDashboard',
      component: PersonalDashboard,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup,
    },
  ],
});
