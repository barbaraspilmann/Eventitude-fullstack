<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="email" />

      <label for="password">Password:</label>
      <input type="password" id="password" v-model="password" />

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    handleLogin() {
      console.log("Email:", this.email);
      console.log("Password:", this.password);
    }
  }
};
</script>

<style scoped>
/* Scoped styles for Login.vue */
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  margin-bottom: 15px;
  padding: 8px;
  width: 200px;
}

button {
  padding: 8px 15px;
  background-color: #007bff;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
