<template>
    <div class="event-card">
      <h3>{{ event.title }}</h3>
      <p><strong>Date:</strong> {{ event.date }}</p>
      <p>{{ event.description }}</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'EventCard',
    props: {
      event: {
        type: Object,
        required: true,
      },
    },
  };
  </script>
  
  <style>
  .event-card {
    border: 1px solid #ccc;
    padding: 15px;
    margin: 10px 0;
    border-radius: 5px;
    background-color: #f9f9f9;
  }
  </style>
  