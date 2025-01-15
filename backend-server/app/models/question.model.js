const db = require('../database');

const insertQuestion = (data) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO questions (event_id, question, asked_by) VALUES (?, ?, ?)`;
    const values = [data.event_id, data.question, data.asked_by];

    db.run(sql, values, function (err) {
      if (err) reject(err);
      resolve(this.lastID); // question_id
    });
  });
};

const findQuestionById = (questionId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT 
      question_id as questionId, 
      event_id as eventId, 
      question, 
      asked_by as askedBy 
    FROM questions 
    WHERE question_id = ?`;

    db.get(sql, [questionId], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

const deleteQuestionById = (questionId) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM questions WHERE question_id = ?`;

    db.run(sql, [questionId], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports = {
  insertQuestion,
  findQuestionById,
  deleteQuestionById,
};
