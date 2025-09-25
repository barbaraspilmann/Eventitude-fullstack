import { createRouter, createWebHistory } from 'vue-router';

import Home from '../views/pages/Home.vue';
import CreateEvent from '../views/pages/CreateEvent.vue';
import SearchEvent from '../views/pages/SearchEvent.vue';
import Login from '../views/pages/Login.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/create-event', component: CreateEvent, meta: { requiresAuth: true } },
  { path: '/search-event', component: SearchEvent },
  { path: '/login', component: Login },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

