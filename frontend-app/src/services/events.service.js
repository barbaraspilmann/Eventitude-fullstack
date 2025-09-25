const addEvent = (eventData) => {
  const token = localStorage.getItem('session_token');
  return fetch('http://localhost:3333/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': token,
    },
    body: JSON.stringify(eventData),
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((error) => {
        throw new Error(error.error_message || 'An error occurred');
      });
    }
    return response.json();
  });
};

const getEvents = () => {
  return fetch('http://localhost:3333/events')
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(`${response.status} - ${response.statusText}`);
    })
    .catch((error) => {
      console.error('Error fetching events:', error);
      return Promise.reject(error);
    });
};

export const eventsService = { addEvent, getEvents };

