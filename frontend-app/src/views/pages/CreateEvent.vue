<template>
  <div class="container my-5">
    <h1 class="text-center mb-4">Create a New Event</h1>
    <form @submit.prevent="addEvent" class="bg-light p-4 rounded shadow">
      <div class="mb-3">
        <label for="name" class="form-label">Event Name:</label>
        <input
          type="text"
          id="name"
          class="form-control"
          v-model="eventData.name"
          placeholder="Enter event name"
          required
        />
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description:</label>
        <textarea
          id="description"
          class="form-control"
          v-model="eventData.description"
          rows="3"
          placeholder="Enter event description"
          required
        ></textarea>
      </div>
      <div class="mb-3">
        <label for="location" class="form-label">Location:</label>
        <input
          type="text"
          id="location"
          class="form-control"
          v-model="eventData.location"
          placeholder="Enter event location"
          required
        />
      </div>
      <div class="mb-3">
        <label for="start" class="form-label">Start Date & Time:</label>
        <input
          type="datetime-local"
          id="start"
          class="form-control"
          v-model="eventData.start"
          required
        />
      </div>
      <div class="mb-3">
        <label for="close_registration" class="form-label">
          Close Registration Date & Time:
        </label>
        <input
          type="datetime-local"
          id="close_registration"
          class="form-control"
          v-model="eventData.close_registration"
          required
        />
      </div>
      <div class="mb-3">
        <label for="max_attendees" class="form-label">Maximum Attendees:</label>
        <input
          type="number"
          id="max_attendees"
          class="form-control"
          v-model="eventData.max_attendees"
          placeholder="Enter max attendees"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary w-100">Create Event</button>
    </form>
    <div v-if="successMessage" class="alert alert-success mt-3 text-center">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert alert-danger mt-3 text-center">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { eventsService } from "../../services/events.service";

export default {
  data() {
    return {
      eventData: {
        name: "",
        description: "",
        location: "",
        start: "",
        close_registration: "",
        max_attendees: null,
      },
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    addEvent() {
      this.successMessage = "";
      this.errorMessage = "";

      const payload = {
        ...this.eventData,
        start: new Date(this.eventData.start).toISOString(),
        close_registration: new Date(
          this.eventData.close_registration
        ).toISOString(),
      };

      eventService
        .addEvent(payload)
        .then(() => {
          this.successMessage = "Event created successfully!";
          this.eventData = {
            name: "",
            description: "",
            location: "",
            start: "",
            close_registration: "",
            max_attendees: null,
          };
        })
        .catch((error) => {
          this.errorMessage = error.message || "An error occurred.";
        });
    },
  },
};
</script>
