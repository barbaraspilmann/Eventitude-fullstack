import { createRouter, createWebHistory } from 'vue-router';

// Import all page components
import Home from '../views/pages/Home.vue';
import CreateEvent from '../views/pages/CreateEvent.vue'; // Ensure this path is correct
import SearchEvent from '../views/pages/SearchEvent.vue'; // Ensure this path is correct
import Login from '../views/pages/Login.vue';

const routes = [
  { path: '/', component: Home }, // Home Page
  { path: '/create-event', component: CreateEvent }, // Create Event Page
  { path: '/search-event', component: SearchEvent }, // Search Event Page
  { path: '/login', component: Login }, // Login Page
  { path: '/:pathMatch(.*)*', redirect: '/' }, // Catch-all route to redirect to Home
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;


