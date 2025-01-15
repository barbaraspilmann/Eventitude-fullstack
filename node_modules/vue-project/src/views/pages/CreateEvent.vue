<template>
  <div>
    <h1>Create an Event</h1>
    <form @submit.prevent="createEvent">
      <label for="title">Event Title:</label>
      <input type="text" id="title" v-model="title" required />

      <label for="date">Event Date:</label>
      <input type="date" id="date" v-model="date" required />

      <label for="description">Event Description:</label>
      <textarea id="description" v-model="description" required></textarea>

      <button type="submit">Create Event</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'CreateEvent',
  data() {
    return {
      title: '',
      date: '',
      description: '',
    };
  },
  methods: {
    createEvent() {
      console.log('Event created:', {
        title: this.title,
        date: this.date,
        description: this.description,
      });
      alert('Event Created Successfully!');
    },
  },
};
</script>

<style>
form {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: auto;
}

label {
  margin-bottom: 5px;
}

input, textarea, button {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: blue;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: darkblue;
}
</style>
