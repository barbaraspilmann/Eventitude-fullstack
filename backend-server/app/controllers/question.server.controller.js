const Joi = require('joi');
const questionModel = require('../models/question.model');

// Validation schemas for questions
const createQuestionSchema = Joi.object({
    question: Joi.string().min(10).required(),
    asked_by: Joi.number().integer().required(),
    event_id: Joi.number().integer().required()
});

// Create a new question
const create_question = (req, res) => {
    const { error } = createQuestionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    questionModel.addNewQuestion(req.body, (err, questionId) => {
        if (err) return res.status(500).json({ error: 'Error to create Question' });
        res.status(201).json({ message: 'Question created sucessfully', questionId });
    });
};

// Get question by ID
const get_question = (req, res) => {
    const questionId = req.params.question_id;
    questionModel.findQuestionById(questionId, (err, question) => {
        if (err) return res.status(500).json({ error: 'Error to search Question' });
        if (!question) return res.status(404).json({ error: 'Question not Found' });
        res.status(200).json(question);
    });
};

// Delete a question by ID
const delete_question = (req, res) => {
    const questionId = req.params.question_id;
    questionModel.deleteQuestionById(questionId, (err) => {
        if (err) return res.status(500).json({ error: 'Error to delete Question' });
        res.status(200).json({ message: 'Question Deleted' });
    });
};

module.exports = {
    create_question,
    get_question,
    delete_question
};

