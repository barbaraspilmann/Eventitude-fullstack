<template>
  <div>
    <h1>Welcome to Event Management</h1>
    <em v-if="loading">Loading events...</em>
    <ul v-if="events.length">
      <li v-for="(event, index) in events" :key="index">
        <h3>{{ event.title }}</h3>
        <p>{{ event.date }}</p>
        <p>{{ event.description }}</p>
      </li>
    </ul>
    <div v-if="error">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { eventService } from "../../services/events.service";

export default {
  name: "Home",
  data() {
    return {
      events: [],
      loading: true,
      error: "",
    };
  },
  mounted() {
  eventService
    .getEvents()
    .then((events) => {
      console.log("Fetched events:", events); // Log the events
      this.events = events; // Populate events array
      this.loading = false;
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
      this.error = "Failed to load events.";
      this.loading = false;
    });
  },
};
</script>

<style>
h1 {
  text-align: center;
  margin-bottom: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
</style>

