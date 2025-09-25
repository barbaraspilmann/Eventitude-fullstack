const Joi = require('joi');
const eventModel = require('../models/event.model');
const questionModel = require('../models/question.model');


// Custom validation to support both ISO 8601 and timestamp formats
const customDateValidation = (value, helpers) => {
  const date = isNaN(value) ? new Date(value) : new Date(parseInt(value));
  if (isNaN(date.getTime())) {
    return helpers.error('any.invalid', { value });
  }
  return date.toISOString(); // Normalize to ISO format
};

// Validation schema for incoming event data
const addEventSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  start: Joi.date().iso().greater('now').required(), // Start date must be in the future
  close_registration: Joi.date().iso().less(Joi.ref('start')).required(), // Close registration must be before the start date
  max_attendees: Joi.number().integer().positive().required(), // Must be a positive integer
});


let Filter;
(async () => {
    const badWordsModule = await import('bad-words');
    Filter = badWordsModule.Filter; // Use the named export
    console.log('Filter initialized');
})();

async function doesEventExist(name, creatorId) {
  const existingEvent = await eventModel.findEventByName(name, creatorId); // Adjust based on your schema
  return existingEvent !== undefined;
}

const addEvent = async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    // Check if the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ error_message: 'Unauthorized. Please log in.' });
    }

    for (const event of events) {
      const { name, description, location, start, close_registration, max_attendees } = event;

      // Ensure all fields are provided
      if (!name || !description || !location || !start || !close_registration || !max_attendees) {
        return res.status(400).json({ error_message: 'All fields are required.' });
      }

      // Validate start and close_registration dates
      const parsedStart = isNaN(start) ? new Date(start) : new Date(parseInt(start));
      const parsedCloseReg = isNaN(close_registration) ? new Date(close_registration) : new Date(parseInt(close_registration));

      if (isNaN(parsedStart.getTime()) || parsedStart <= Date.now()) {
        return res.status(400).json({ error_message: 'Invalid or past start time.' });
      }
      if (isNaN(parsedCloseReg.getTime()) || parsedCloseReg >= parsedStart) {
        return res.status(400).json({ error_message: 'Invalid registration close time.' });
      }

      // Validate max_attendees
      if (!Number.isInteger(max_attendees) || max_attendees <= 0) {
        return res.status(400).json({ error_message: 'max_attendees must be a positive integer.' });
      }

      // Check for profanity in event fields
      const filter = new Filter();
      if (filter.isProfane(name) || filter.isProfane(description)) {
        return res.status(400).json({ error_message: 'Profanity is not allowed in event name or description.' });
      }

      // Check if the event already exists for the user
      const isDuplicate = await eventModel.findEventByName(name, req.userId);
      if (isDuplicate) {
        return res.status(409).json({ error_message: 'Duplicate event. Event with this name already exists for the user.' });
      }

      // Add the event to the database
      await eventModel.addEvent({
        name,
        description,
        location,
        start: parsedStart.toISOString(),
        close_registration: parsedCloseReg.toISOString(),
        max_attendees,
        creator_id: req.userId,
      });
    }

    res.status(201).json({ message: 'Events added successfully' });
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


// Validation schema for updating an event
const updateEventSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  location: Joi.string(),
  start_date: Joi.date().iso().greater('now'), // Start date must be in the future
  close_registration: Joi.date().iso().less(Joi.ref('start_date')), // Close registration must be before the start date
  max_attendees: Joi.number().integer().positive(), // Must be a positive integer
}).unknown(true); // Allow extra fields


// Update an existing event (PATCH /events/:eventId)
const updateEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    if (!req.userId) {
      return res.status(401).json({ error_message: 'Unauthorized' });
    }

    const event = await eventModel.findEventById(eventId);
    if (!event) {
      return res.status(404).json({ error_message: 'Event not found' });
    }

    if (event.creator_id !== req.userId) {
      return res.status(403).json({ error_message: 'You are not authorized to update this event' });
    }

    const { error } = updateEventSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    await eventModel.updateEvent(eventId, req.body); // Assuming you have this method in your model

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('Error in updateEvent:', err);
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

    // Check if the event is already archived
    if (event.close_registration === -1) {
      return res.status(200).json({ message: 'Event is already archived' });
    }

    // Archive the event
    await eventModel.archiveEvent(req.params.eventId);

    // Respond with success
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

    // Check if the event is archived
    if (event.close_registration === -1) {
      return res.status(403).json({ error_message: 'Registration is closed' });
    }

    // Check if the user is the event creator
    if (event.creator_id === req.userId) {
      return res.status(403).json({ error_message: 'You are already registered' });
    }

    // Check if the event is at capacity
    if (event.attendees_count >= event.max_attendees) {
      return res.status(403).json({ error_message: 'Event is at capacity' });
    }

    // Check if the user is already registered
    const isRegistered = await eventModel.isUserRegisteredForEvent(req.userId, eventId);
    if (isRegistered) {
      return res.status(403).json({ error_message: 'You are already registered' });
    }

    // Register the user for the event
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

    console.log('askQuestion called with:', { eventId, userId: req.userId, question });

    // Ensure the user is authenticated
    if (!req.userId) {
      console.error('User not authenticated');
      return res.status(401).json({ error_message: 'Unauthorized' });
    }

    // Check if the event exists
    let event;
    try {
      event = await eventModel.findEventById(eventId);
      console.log('Event found:', event);
    } catch (err) {
      console.error('Error fetching event:', err);
      return res.status(500).json({ error_message: 'Internal server error while fetching event' });
    }

    if (!event) {
      console.error('Event not found for ID:', eventId);
      return res.status(404).json({ error_message: 'Event not found' });
    }

    // Prevent the creator from asking a question
    if (event.creator_id === req.userId) {
      console.error('User is the creator of the event:', req.userId);
      return res.status(403).json({ error_message: 'Event creators cannot ask questions on their events' });
    }

    // Check if the user is registered for the event
    let isRegistered;
    try {
      isRegistered = await eventModel.isUserRegisteredForEvent(req.userId, eventId);
      console.log('User registration status:', isRegistered);
    } catch (err) {
      console.error('Error checking user registration:', err);
      return res.status(500).json({ error_message: 'Internal server error while checking registration' });
    }

    if (!isRegistered) {
      console.error('User is not registered for the event:', req.userId);
      return res.status(403).json({ error_message: 'You must be registered to ask questions' });
    }

    // Validate the question content
    if (!question || question.trim() === '') {
      console.error('Question is empty or invalid');
      return res.status(400).json({ error_message: 'Question cannot be empty' });
    }

    // Check for extra fields
    if (Object.keys(req.body).length > 1) {
      console.error('Request contains invalid fields:', req.body);
      return res.status(400).json({ error_message: 'Invalid fields in request' });
    }

    // Add the question to the database
    let questionId;
    try {
      questionId = await questionModel.addQuestion(eventId, req.userId, question);
      console.log('Question added with ID:', questionId);
    } catch (err) {
      console.error('Error adding question to the database:', err);
      return res.status(500).json({ error_message: 'Internal server error while adding question' });
    }

    res.status(201).json({ question_id: questionId });
  } catch (err) {
    console.error('Unexpected error in askQuestion:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Search events (GET /search)

const searchEvents = async (req, res) => {
  try {
    const { q, category } = req.query;

    // Call the model's searchEvents method
    const events = await eventModel.searchEvents(q || '', category);

    if (!events || events.length === 0) {
      return res.status(404).json({ error_message: 'No events found' });
    }

    res.status(200).json(events);
  } catch (err) {
    console.error('Error in searchEvents:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Fetch an event by ID (GET /events/:eventId)
const getEventById = async (req, res) => {
  try {
    const event = await eventModel.findEventById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error_message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error('Error in getEventById:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

module.exports = {
  addEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  askQuestion,
  searchEvents,
  getEventById,
  doesEventExist
};
