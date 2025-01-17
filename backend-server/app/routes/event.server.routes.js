const events = require('../controllers/event.server.controller');
const authenticate = require('../lib/authentication');



module.exports = (app) => {
  // Routes for specific event by ID
  app.route('/event/:event_id')
    .get(events.getEventById); // Fetch event details

  // Routes for event collection
  app.route('/events')
    .post(authenticate, events.addEvent); // Add a new event

  // Routes for actions on a specific event
  app.route('/events/:eventId')
    .delete(authenticate, events.deleteEvent); // Delete an event

  app.route('/events/:eventId/register')
    .post(authenticate, events.registerForEvent); // Register for an event

  app.route('/events/:eventId/question')
    .post(authenticate, events.askQuestion); // Ask a question for an event

  // Event search
  app.route('/events/search')
    .get(events.searchEvents); // Search for events
};

