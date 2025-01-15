const Joi = require('joi');
const eventModel = require('../models/event.model');

// Validation schema for incoming event data
const addEventSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  start_date: Joi.date().iso().greater('now').required(), // Start date must be in the future
  close_registration: Joi.date().iso().less(Joi.ref('start_date')).required(), // Close registration must be before the start date
  max_attendees: Joi.number().integer().positive().required(), // Must be a positive integer
});

/////////////////////

let Filter;
(async () => {
    const badWordsModule = await import('bad-words');
    Filter = badWordsModule.Filter; // Use the named export
    console.log('Filter initialized');
})();

const addEvent = async (req, res) => {
  try {
      const { categories } = req.body; // Array of category IDs

      // Validate categories
      if (!Array.isArray(categories)) {
          return res.status(400).json({ error: 'Categories must be an array of category IDs' });
      }

      // Ensure the bad-words filter is initialized
      while (!Filter) {
          await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const filter = new Filter();

      // Sanitize input fields using the filter
      req.body.name = filter.clean(req.body.name);
      req.body.description = filter.clean(req.body.description);

      // Add the event to the database
      const eventId = await eventModel.addEvent({
          ...req.body,
          creator_id: req.userId, // Attach the authenticated user's ID as the creator
      });

      // Associate the event with the provided categories
      const sql = 'INSERT INTO event_categories (event_id, category_id) VALUES (?, ?)';
      categories.forEach((categoryId) => {
          db.run(sql, [eventId, categoryId], (err) => {
              if (err) {
                  console.error('Error associating event with category:', err);
              }
          });
      });

      res.status(201).json({ event_id: eventId });
  } catch (err) {
      console.error('Error in addEvent:', err);
      res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Fetch an event by ID (GET /events/:eventId)
const getEvent = async (req, res) => {
  try {
    const event = await eventModel.findEventById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error_message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error('Error in getEvent:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Delete an event (DELETE /events/:eventId)
const deleteEvent = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error_message: 'Unauthorized' });
    }

    const event = await eventModel.findEventById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error_message: 'Event not found' });
    }

    if (event.creator_id !== req.userId) {
      return res.status(403).json({ error_message: 'You are not the creator of this event' });
    }

    await eventModel.archiveEvent(req.params.eventId);
    res.status(200).json({ message: 'Event archived successfully' });
  } catch (err) {
    console.error('Error in deleteEvent:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Register for an event (POST /events/:eventId/register)
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ error_message: 'Unauthorized' });
    }

    const event = await eventModel.findEventById(eventId);
    if (!event) {
      return res.status(404).json({ error_message: 'Event not found' });
    }

    if (event.attendees_count >= event.max_attendees) {
      return res.status(403).json({ error_message: 'Event is at full capacity' });
    }

    const isRegistered = await eventModel.isUserRegisteredForEvent(req.userId, eventId);
    if (isRegistered) {
      return res.status(403).json({ error_message: 'You are already registered for this event' });
    }

    await eventModel.registerUserForEvent(req.userId, eventId);
    res.status(200).json({ message: 'Successfully registered for event' });
  } catch (err) {
    console.error('Error in registerForEvent:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Ask a question about an event (POST /events/:eventId/question)
const askQuestion = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { question } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error_message: 'Unauthorized' });
    }

    const isRegistered = await eventModel.isUserRegisteredForEvent(req.userId, eventId);
    if (!isRegistered) {
      return res.status(403).json({ error_message: 'You must be registered to ask questions' });
    }

    if (!question || question.trim() === '') {
      return res.status(400).json({ error_message: 'Question cannot be empty' });
    }

    const questionId = await eventModel.addQuestion(eventId, req.userId, question);
    res.status(201).json({ question_id: questionId });
  } catch (err) {
    console.error('Error in askQuestion:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Search events (GET /search)
const searchEvents = async (req, res) => {
  try {
      const { q, category } = req.query; // Query string and category
      const searchTerm = `%${q || ''}%`; // Default to match all if no query is provided

      // Base SQL query
      let sql = `
          SELECT DISTINCT e.* 
          FROM events e
          LEFT JOIN event_categories ec ON e.event_id = ec.event_id
          LEFT JOIN categories c ON ec.category_id = c.category_id
          WHERE (e.name LIKE ? OR e.description LIKE ?)
      `;

      const params = [searchTerm, searchTerm];

      // Add category filter if provided
      if (category) {
          sql += ' AND c.name = ?';
          params.push(category);
      }

      // Execute the query
      db.all(sql, params, (err, rows) => {
          if (err) {
              console.error('Database query error:', err.message);
              return res.status(500).json({ error: 'Internal server error' });
          }

          // Respond with the search results
          res.status(200).json(rows);
      });
  } catch (err) {
      console.error('Unexpected error in searchEvents:', err);
      res.status(500).json({ error: 'Unexpected error occurred' });
  }
};

module.exports = {
  addEvent,
  getEvent,
  deleteEvent,
  registerForEvent,
  askQuestion,
  searchEvents,
};
