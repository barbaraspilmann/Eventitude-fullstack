const getEvents = () => {
  return fetch("http://localhost:3333/events") // Replace with your actual API URL
    .then((response) => {
      console.log("Fetch Response:", response); // Log the response
      if (response.status === 200) {
        return response.json();
      } else {
        throw `Error: ${response.status} - ${response.statusText}`;
      }
    })
    .then((resJson) => {
      console.log("Fetched Data:", resJson); // Log the JSON response
      return resJson;
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
      return Promise.reject(error);
    });
};

// Correctly export the service
export const eventService = {
  getEvents,
};

