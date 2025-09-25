const API_BASE_URL = "http://localhost:3333";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error_message || "An error occurred");
  }
  return response.json();
};

const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(response);
    localStorage.setItem("session_token", data.token);
    return data;
  } catch (error) {
    console.error("Error in login service:", error.message);
    throw error;
  }
};

const logout = async () => {
  const token = localStorage.getItem("session_token");

  if (!token) {
    throw new Error("No session token available.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    await handleResponse(response);

    // Clear token from localStorage
    localStorage.removeItem("session_token");

    console.log("Logout successful");
  } catch (error) {
    console.error("Error in logout service:", error.message);
    throw error;
  }
};

export const authService = {
  login,
  logout,
};
