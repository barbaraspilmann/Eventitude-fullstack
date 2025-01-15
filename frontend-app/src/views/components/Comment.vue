<template>
    <div class="comment">
      <h4>{{ username }}</h4>
      <p>{{ content }}</p>
    </div>
  </template>
  
  <script>
  export default {
    name: "Comment",
    props: {
      username: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .comment {
    border: 1px solid #ccc;
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    background-color: #f9f9f9;
  }
  </style>
  