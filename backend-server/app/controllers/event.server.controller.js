const Joi = require('joi');
const eventModel = require('../models/event.model');
const questionModel = require('../models/question.model');


// Validation schema for incoming event data
const addEventSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  start: Joi.date().iso().greater('now').required(), // Start date must be in the future
  close_registration: Joi.date().iso().less(Joi.ref('start')).required(), // Close registration must be before the start date
  max_attendees: Joi.number().integer().positive().required(), // Must be a positive integer
});

// Validation schema for updating an event
const updateEventSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  location: Joi.string(),
  start_date: Joi.date().iso().greater('now'), // Start date must be in the future
  close_registration: Joi.date().iso().less(Joi.ref('start_date')), // Close registration must be before the start date
  max_attendees: Joi.number().integer().positive(), // Must be a positive integer
}).unknown(true); // Allow extra fields

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
    // Ensure req.body is always an array
    const events = Array.isArray(req.body) ? req.body : [req.body];

    // Check if the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ error_message: 'Unauthorized. Please log in.' });
    }

    // Validate and process each event
    for (const event of events) {
      const { name, description, location, start, close_registration, max_attendees } = event;

      // Check for required fields
      if (!name || !description || !location || !start || !close_registration || !max_attendees) {
        return res.status(400).json({ error_message: 'All fields are required.' });
      }

      // Validate start and close_registration timestamps
      const startTime = new Date(parseInt(start));
      const closeRegTime = new Date(parseInt(close_registration));

      if (isNaN(startTime.getTime()) || startTime <= Date.now()) {
        return res.status(400).json({ error_message: 'Invalid or past start time.' });
      }
      if (isNaN(closeRegTime.getTime()) || closeRegTime >= startTime || close_registration === "-1") {
        return res.status(400).json({ error_message: 'Invalid registration close time.' });
      }

      // Validate max_attendees
      if (!Number.isInteger(max_attendees) || max_attendees <= 0) {
        return res.status(400).json({ error_message: 'max_attendees must be a positive integer.' });
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
        start: startTime.toISOString(),
        close_registration: closeRegTime.toISOString(),
        max_attendees,
        creator_id: req.userId,
      });
    }

    res.status(201).json({ message: 'Events added successfully' });
  } catch (err) {
    console.error('Error in addEvents:', err);
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

    // Ensure the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ error_message: 'Unauthorized' });
    }

    // Check if the event exists
    const event = await eventModel.findEventById(eventId);
    if (!event) {
      return res.status(404).json({ error_message: 'Event not found' });
    }

    // Prevent the creator from asking a question
    if (event.creator_id === req.userId) {
      return res.status(403).json({ error_message: 'Event creators cannot ask questions on their events' });
    }

    // Check if the user is registered for the event
    const isRegistered = await eventModel.isUserRegisteredForEvent(req.userId, eventId);
    if (!isRegistered) {
      return res.status(403).json({ error_message: 'You must be registered to ask questions' });
    }

    // Validate the question content
    if (!question || question.trim() === '') {
      return res.status(400).json({ error_message: 'Question cannot be empty' });
    }

    // Check for extra fields
    if (Object.keys(req.body).length > 1) {
      return res.status(400).json({ error_message: 'Invalid fields in request' });
    }

    // Add the question to the database
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
    const { q, category } = req.query;
    const events = await eventModel.searchEvents(q, category);
    res.status(200).json(events);
  } catch (err) {
    console.error('Error in searchEvents:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// This function should return varying levels of detail based on whether the 
// user is authenticated, and if authenticated, whether the user is the event creator or a regular attendee
const getEventById = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Fetch event details
    const event = await eventModel.findEventById(event_id);
    if (!event) {
      return res.status(404).json({ error_message: 'Event not found' });
    }

    // Fetch the number of attendees
    const numberAttending = await eventModel.getNumberOfAttendees(event_id);
    event.number_attending = numberAttending;

    // Fetch the list of questions for the event, sorted by votes
    const questions = await questionModel.getQuestionsForEvent(event_id);
    event.questions = questions;

    // Handle authentication
    const userId = req.userId; // Provided by middleware if user is authenticated
    if (!userId) {
      // If not authenticated, do not return attendees
      delete event.attendees;
      return res.status(200).json(event);
    }

    // Fetch attendee list if the user is the creator
    if (userId === event.creator_id) {
      const attendees = await eventModel.getAttendeesForEvent(event_id);
      event.attendees = attendees;
    }

    // Return event details
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
