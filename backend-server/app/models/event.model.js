const db = require('../database');

// Find event by ID
const findEventById = (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT *, 
                 (SELECT COUNT(*) FROM attendees WHERE event_id = events.event_id) as attendees_count
                 FROM events WHERE event_id = ?`;
    db.get(sql, [eventId], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

// Add a new event
const addEvent = (eventData) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO events (name, description, location, start_date, close_registration, max_attendees, creator_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      eventData.name,
      eventData.description,
      eventData.location,
      eventData.start_date,
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

// Search events
const searchEvents = (query) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM events WHERE name LIKE ? OR description LIKE ?`;
    const searchTerm = `%${query}%`;
    db.all(sql, [searchTerm, searchTerm], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

module.exports = {
  findEventById,
  addEvent,
  archiveEvent,
  registerUserForEvent,
  isUserRegisteredForEvent,
  searchEvents,
};