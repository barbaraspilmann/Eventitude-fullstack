const events = require('../controllers/event.server.controller');
const authenticate = require('../lib/authentication');
//////////////

///////////////////
module.exports = (app) => {
  app.route('/events')
    .post(authenticate, events.addEvent); // Add a new event

  app.route('/events/:eventId')
    .get(events.getEvent) // Fetch an event by ID
    .delete(authenticate, events.deleteEvent); // Delete an event

  app.route('/events/:eventId/register')
    .post(authenticate, events.registerForEvent); // Register for an event

  app.route('/events/:eventId/question')
    .post(authenticate, events.askQuestion); // Ask a question for an event

  app.route('/search')
    .get(events.searchEvents); // Search for events



};
