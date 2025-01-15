const crypto = require('crypto');
const db = require('../database');

// Function to hash passwords
const getHash = (password, salt) =>
  crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

// Function to add a new user to the database
const addNewUser = async (user) => {
  try {
    const emailExists = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [user.email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (emailExists) {
      return { error: 'Email already exists.' };
    }

    const salt = crypto.randomBytes(64).toString('hex');
    const hash = getHash(user.password, salt);

    const userId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)',
        [user.first_name, user.last_name, user.email, hash, salt],
        function (err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    return { userId };
  } catch (error) {
    throw error;
  }
};

// Function to find a user by email
const findUserByEmail = async (email) => {
  try {
    const sql = 'SELECT user_id, password, salt, session_token FROM users WHERE email = ?';
    return await new Promise((resolve, reject) => {
      db.get(sql, [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  } catch (error) {
    throw error;
  }
};

// Function to set a session token for a user
const setToken = async (userId, token) => {
  try {
    const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';
    return await new Promise((resolve, reject) => {
      db.run(sql, [token, userId], function (err) {
        if (err) reject(err);
        resolve(this.changes > 0); // Returns true if a row was updated
      });
    });
  } catch (error) {
    throw error;
  }
};

// Function to remove a session token
const removeToken = async (token) => {
  try {
    const sql = 'UPDATE users SET session_token = NULL WHERE session_token = ?';
    return await new Promise((resolve, reject) => {
      db.run(sql, [token], function (err) {
        if (err) reject(err);
        resolve(this.changes > 0); // Returns true if a row was updated
      });
    });
  } catch (error) {
    throw error;
  }
};

// Export all functions
module.exports = {
  getHash,
  addNewUser,
  findUserByEmail,
  setToken,
  removeToken,
};





