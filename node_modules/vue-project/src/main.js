import { createApp } from 'vue';
import App from './views/App.vue';
import router from './router'; // Import the router

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Create the Vue app and use the router
const app = createApp(App);

app.use(router); // Use the router
app.mount('#app'); // Mount the app
