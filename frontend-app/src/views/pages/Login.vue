<template>
  <div class="container my-5">
    <h1 class="text-center mb-4">Login</h1>
    <form @submit.prevent="handleLogin" class="bg-light p-4 rounded shadow">
      <div class="mb-3">
        <label for="email" class="form-label">Email Address</label>
        <input
          type="email"
          id="email"
          class="form-control"
          v-model="email"
          placeholder="Enter your email"
          required
        />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
          type="password"
          id="password"
          class="form-control"
          v-model="password"
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>
    <p v-if="errorMessage" class="text-danger text-center mt-3">{{ errorMessage }}</p>
    <p v-if="successMessage" class="text-success text-center mt-3">{{ successMessage }}</p>
  </div>
</template>

<script>
import { authService } from "../../services/auth.service";

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      successMessage: "",
    };
  },
  methods: {
    handleLogin() {
      this.errorMessage = "";
      this.successMessage = "";
      authService
        .login(this.email, this.password)
        .then((response) => {
          this.successMessage = "Login successful!";
          localStorage.setItem("session_token", response.token); // Save the token
          this.$router.push("/"); // Redirect to home
        })
        .catch((error) => {
          this.errorMessage =
            error.message || "An error occurred during login.";
        });
    },
  },
};


</script>
