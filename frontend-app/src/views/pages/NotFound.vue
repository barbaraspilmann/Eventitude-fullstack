<template>
  <div class="create-event-page">
    <h1>Create a New Event</h1>
    <form @submit.prevent="addEvent" class="event-form">
      <div class="form-group">
        <label for="name">Event Name:</label>
        <input
          type="text"
          id="name"
          v-model="eventData.name"
          placeholder="Enter event name"
          required
        />
      </div>

      <div class="form-group">
        <label for="description">Description:</label>
        <textarea
          id="description"
          v-model="eventData.description"
          placeholder="Enter event description"
          rows="4"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="location">Location:</label>
        <input
          type="text"
          id="location"
          v-model="eventData.location"
          placeholder="Enter location"
          required
        />
      </div>

      <div class="form-group">
        <label for="start">Start Date & Time:</label>
        <input
          type="datetime-local"
          id="start"
          v-model="eventData.start"
          required
        />
      </div>

      <div class="form-group">
        <label for="close_registration">Close Registration Date & Time:</label>
        <input
          type="datetime-local"
          id="close_registration"
          v-model="eventData.close_registration"
          required
        />
      </div>

      <div class="form-group">
        <label for="max_attendees">Maximum Attendees:</label>
        <input
          type="number"
          id="max_attendees"
          v-model="eventData.max_attendees"
          placeholder="Enter maximum attendees"
          required
        />
      </div>

      <button type="submit" class="submit-btn">Create Event</button>
    </form>

    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { eventService } from "../../services/events.service";

export default {
  name: "CreateEvent",
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

      // Convert dates to ISO format
      const eventPayload = {
        ...this.eventData,
        start: new Date(this.eventData.start).toISOString(),
        close_registration: new Date(this.eventData.close_registration).toISOString(),
      };

      eventService
        .addEvent(eventPayload)
        .then((response) => {
          this.successMessage = "Event created successfully!";
          console.log("Event created:", response);

          // Reset the form after success
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
          this.errorMessage =
            error.message || "An error occurred while creating the event.";
          console.error("Error creating event:", error);
        });
    },
  },
};
</script>

<style scoped>
/* Centered container for the page */
.create-event-page {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

/* Title */
h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

/* Form styles */
.event-form {
  display: flex;
  flex-direction: column;
}

/* Form group styles */
.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  resize: vertical;
}

/* Button styles */
.submit-btn {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #0056b3;
}

/* Success and error messages */
.success-message {
  color: #4caf50;
  text-align: center;
  margin-top: 20px;
}

.error-message {
  color: #f44336;
  text-align: center;
  margin-top: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .create-event-page {
    padding: 10px;
  }

  h1 {
    font-size: 20px;
  }

  input,
  textarea,
  .submit-btn {
    font-size: 14px;
  }
}
</style>
