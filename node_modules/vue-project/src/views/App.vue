<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/create-event">Create Event</router-link> |
      <router-link to="/search-event">Search Event</router-link> |
      <router-link to="/login">Login</router-link>
    </nav>
    <router-view /> <!-- Renders the current route -->
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
nav {
  margin-bottom: 20px;
  text-align: center;
}

nav a {
  margin: 0 10px;
  text-decoration: none;
  color: blue;
}

nav a:hover {
  text-decoration: underline;
}
</style>
