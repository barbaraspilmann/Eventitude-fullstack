<template>
  <div>
    <!-- Black Header with Navigation -->
    <header class="bg-dark text-white py-3">
      <div class="container d-flex justify-content-between align-items-center">
        <h1 class="m-0">Eventitude</h1>
        <nav class="d-flex">
          <a href="/" class="btn btn-light mx-2">Home</a>
          <a href="/create-event" class="btn btn-light mx-2">Create Event</a>
          <a href="/search-event" class="btn btn-light mx-2">Search Events</a>
          <a
            v-if="!isLoggedIn"
            href="/login"
            class="btn btn-outline-light mx-2"
          >
            Login
          </a>
          <button
            v-if="isLoggedIn"
            class="btn btn-danger mx-2"
            @click="handleLogout"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>

    <!-- Login/Logout Notification -->
    <div
      v-if="notificationMessage"
      class="alert alert-success text-center m-3"
      role="alert"
      style="position: sticky; top: 0; z-index: 1050;"
    >
      {{ notificationMessage }}
    </div>

    <!-- Main App Content -->
    <main class="py-4">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      isLoggedIn: false, // Tracks login status
      notificationMessage: "", // Message for login/logout feedback
    };
  },
  mounted() {
    this.checkLoginStatus();
  },
  methods: {
    // Check if the user is logged in
    checkLoginStatus() {
      const token = localStorage.getItem("session_token");
      if (token) {
        this.isLoggedIn = true;
      }
    },
    // Handle logout and clear session locally
    handleLogout() {
      localStorage.clear(); // Clear all stored tokens
      this.isLoggedIn = false; // Update the logged-in status
      this.showNotification("You have logged out successfully.");
      this.$router.push("/login"); // Redirect to login page
    },
    // Display a notification message
    showNotification(message) {
      this.notificationMessage = message;
      setTimeout(() => {
        this.notificationMessage = ""; // Clear the message after 3 seconds
      }, 3000);
    },
  },
};
</script>

<style>
/* Styling for the header */
header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Add some spacing for the content below the header */
main {
  margin-top: 20px;
}

/* Styling for notification */
.alert {
  position: sticky;
  top: 0;
  z-index: 1050;
}
</style>
