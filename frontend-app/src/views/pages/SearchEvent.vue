<template>
  <div>
    <h1>Search Events</h1>
    <form @submit.prevent="searchEvent">
      <label for="search">Search for Events:</label>
      <input
        type="text"
        id="search"
        v-model="query"
        placeholder="Enter keywords"
        required
      />
      <button type="submit">Search</button>
    </form>

    <div v-if="results.length">
      <h2>Search Results:</h2>
      <ul>
        <li v-for="(result, index) in results" :key="index">
          <EventCard :event="result" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import EventCard from '../components/EventCard.vue';

export default {
  name: 'SearchEvent',
  components: { EventCard },
  data() {
    return {
      query: '',
      results: [],
    };
  },
  methods: {
    searchEvent() {
      console.log('Searching for:', this.query);
      this.results = [
        {
          title: 'Vue.js Workshop',
          date: '2023-03-15',
          description: 'Learn Vue.js basics.',
        },
        {
          title: 'Advanced Vue',
          date: '2023-04-10',
          description: 'Master advanced Vue techniques.',
        },
      ];
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

input,
button {
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
