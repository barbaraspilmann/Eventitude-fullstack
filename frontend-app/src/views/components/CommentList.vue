<template>
    <div>
      <h2>All Comments</h2>
      <Comment
        v-for="(comment, index) in comments"
        :key="index"
        :username="comment.username"
        :content="comment.content"
      />
    </div>
  </template>
  
  <script>
  import Comment from "./views/pages/Comment.vue";
  
  export default {
    name: "CommentList",
    components: {
      Comment
    },
    data() {
      return {
        comments: [
          { username: "John Doe", content: "This is a great post!" },
          { username: "Jane Smith", content: "Thanks for sharing this!" },
          { username: "Alex Johnson", content: "I completely agree!" }
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  h2 {
    margin-bottom: 20px;
    text-align: center;
  }
  </style>
  