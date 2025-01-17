const Joi = require('joi');
const questionModel = require('../models/question.model');

// Create a new question
const create_question = async (req, res) => {
  try {
    const { question } = req.body;
    const { event_id } = req.params;

    // Ensure the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ error_message: 'Unauthorized' });
    }

    // Validate question
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error_message: 'Question is required and cannot be empty' });
    }

    if (Object.keys(req.body).length > 1) {
      return res.status(400).json({ error_message: 'Invalid fields in request' });
    }

    // Check if user is registered for the event
    const isRegistered = await questionModel.isUserRegisteredForEvent(req.userId, event_id);
    if (!isRegistered) {
      return res.status(403).json({ error_message: 'You must be registered to ask questions' });
    }

    // Prevent event creator from asking questions
    const isCreator = await questionModel.isEventCreator(req.userId, event_id);
    if (isCreator) {
      return res.status(403).json({ error_message: 'Event creators cannot ask questions' });
    }

    // Add the question
    const questionId = await questionModel.addNewQuestion(event_id, req.userId, question);
    res.status(201).json({ question_id: questionId });
  } catch (err) {
    console.error('Error in create_question:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Get question by ID
const get_question = async (req, res) => {
  try {
    const { question_id } = req.params;

    const question = await questionModel.findQuestionById(question_id);
    if (!question) {
      return res.status(404).json({ error_message: 'Question not found' });
    }

    res.status(200).json(question);
  } catch (err) {
    console.error('Error in get_question:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Delete a question by ID
const delete_question = async (req, res) => {
  try {
    const { question_id } = req.params;

    // Ensure the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ error_message: 'Unauthorized' });
    }

    // Find the question
    const question = await questionModel.findQuestionById(question_id);
    if (!question) {
      return res.status(404).json({ error_message: 'Question not found' });
    }

    // Check if the user is the author or the event creator
    const isAuthor = question.asked_by === req.userId;
    const isEventCreator = await questionModel.isEventCreator(req.userId, question.event_id);

    if (!isAuthor && !isEventCreator) {
      return res.status(403).json({ error_message: 'You do not have permission to delete this question' });
    }

    // Delete the question
    await questionModel.deleteQuestionById(question_id);
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error in delete_question:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

module.exports = {
  create_question,
  get_question,
  delete_question,
};
