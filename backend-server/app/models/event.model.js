const db = require('../database');
const sqlite3 = require('sqlite3').verbose();

// Find event by name
async function findEventByName(name, creatorId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM events WHERE name = ? AND creator_id = ?`;
    db.get(query, [name, creatorId], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row); // Row is undefined if no match is found
    });
  });
}

// Find event by ID
const findEventById = (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT e.event_id, e.name, e.description, e.location, e.start_date, 
             e.close_registration, e.max_attendees, 
             u.user_id AS creator_id, u.first_name, u.last_name
      FROM events e
      JOIN users u ON e.creator_id = u.user_id
      WHERE e.event_id = ?
    `;
    db.get(sql, [eventId], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

// Add a new event
const addEvent = (eventData) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO events (name, description, location, start_date, close_registration, max_attendees, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      eventData.name,
      eventData.description,
      eventData.location,
      eventData.start,
      eventData.close_registration,
      eventData.max_attendees,
      eventData.creator_id,
    ];
    db.run(sql, values, function (err) {
      if (err) reject(err);
      resolve(this.lastID);
    });
  });
};

// Archive (soft delete) an event
const archiveEvent = (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE events SET close_registration = -1 WHERE event_id = ?`;
    db.run(sql, [eventId], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

// Register user for an event
const registerUserForEvent = (userId, eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO attendees (event_id, user_id) VALUES (?, ?)`;
    db.run(sql, [eventId, userId], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

// Check if user is already registered
const isUserRegisteredForEvent = (userId, eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM attendees WHERE event_id = ? AND user_id = ?`;
    db.get(sql, [eventId, userId], (err, row) => {
      if (err) reject(err);
      resolve(!!row);
    });
  });
};

// Update event attendees count
const updateAttendeesCount = (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE events
      SET attendees_count = (SELECT COUNT(*) FROM attendees WHERE event_id = ?)
      WHERE event_id = ?
    `;
    db.run(sql, [eventId, eventId], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

// Search events
const searchEvents = (query, category) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT DISTINCT e.* 
      FROM events e
      LEFT JOIN event_categories ec ON e.event_id = ec.event_id
      LEFT JOIN categories c ON ec.category_id = c.category_id
      WHERE (e.name LIKE ? OR e.description LIKE ?)
    `;
    const params = [`%${query}%`, `%${query}%`];

    if (category) {
      sql += ' AND c.name = ?';
      params.push(category);
    }

    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};


// Add a question for an event
const addQuestion = (eventId, userId, question) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO questions (event_id, asked_by, question, votes)
      VALUES (?, ?, ?, 0)
    `;
    db.run(sql, [eventId, userId, question], function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this.lastID); // Return the ID of the newly inserted question
    });
  });
};

// Get the number of attendees for an event
const getNumberOfAttendees = (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT COUNT(*) AS count FROM attendees WHERE event_id = ?`;
    db.get(sql, [eventId], (err, row) => {
      if (err) return reject(err);
      resolve(row.count);
    });
  });
};

// Get attendees for an event
const getAttendeesForEvent = (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.user_id, u.first_name, u.last_name, u.email
      FROM attendees a
      JOIN users u ON a.user_id = u.user_id
      WHERE a.event_id = ?
    `;
    db.all(sql, [eventId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Update an event
const updateEvent = (eventId, updatedFields) => {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(updatedFields).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updatedFields);
    values.push(eventId);

    const sql = `
      UPDATE events
      SET ${fields}
      WHERE event_id = ?
    `;

    db.run(sql, values, function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this.changes > 0); // Return true if rows were updated
    });
  });
};

module.exports = {
  findEventById,
  addEvent,
  archiveEvent,
  registerUserForEvent,
  isUserRegisteredForEvent,
  updateAttendeesCount,
  searchEvents,
  addQuestion,
  getNumberOfAttendees,
  getAttendeesForEvent,
  findEventByName,
  updateEvent
};
