const db = require('../database');

// Add a new question
const addNewQuestion = (eventId, userId, question) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO questions (event_id, user_id, question) VALUES (?, ?, ?)`;
    db.run(sql, [eventId, userId, question], function (err) {
      if (err) return reject(err);
      resolve(this.lastID); // Return the question ID
    });
  });
};

// Find question by ID
const findQuestionById = (questionId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM questions WHERE question_id = ?`;
    db.get(sql, [questionId], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

// Delete question by ID
const deleteQuestionById = (questionId) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM questions WHERE question_id = ?`;
    db.run(sql, [questionId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Check if the user is registered for the event
const isUserRegisteredForEvent = (userId, eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM attendees WHERE user_id = ? AND event_id = ?`;
    db.get(sql, [userId, eventId], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
};

// Check if the user is the event creator
const isEventCreator = (userId, eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM events WHERE event_id = ? AND creator_id = ?`;
    db.get(sql, [eventId, userId], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
};

const getQuestionsForEvent = (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT q.question_id, q.question, q.votes, 
             u.user_id AS asked_by_user_id, u.first_name AS asked_by_first_name
      FROM questions q
      JOIN users u ON q.asked_by = u.user_id
      WHERE q.event_id = ?
      ORDER BY q.votes DESC`;
    db.all(sql, [eventId], (err, rows) => {
      if (err) return reject(err);

      const questions = rows.map((row) => ({
        question_id: row.question_id,
        question: row.question,
        votes: row.votes,
        asked_by: {
          user_id: row.asked_by_user_id,
          first_name: row.asked_by_first_name,
        },
      }));

      resolve(questions);
    });
  });
};

module.exports = {
  addNewQuestion,
  findQuestionById,
  deleteQuestionById,
  isUserRegisteredForEvent,
  isEventCreator,
  getQuestionsForEvent
};
