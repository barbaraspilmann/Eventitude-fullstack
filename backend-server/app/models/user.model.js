const bcrypt = require('bcrypt');
const db = require('../database');

const addNewUser = async (user) => {
    try {
        // Check for duplicate email
        const emailExists = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [user.email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        if (emailExists) {
            return { error: 'Email already exists.' };
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);

        // Insert new user into the database
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

const isValidToken = (userId, token) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT session_token FROM users WHERE user_id = ?';
        db.get(sql, [userId], (err, row) => {
            if (err) reject(err);
            resolve(row && row.session_token === token);
        });
    });
};

const setToken = (userId, token) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';
        db.run(sql, [token, userId], function(err) {
            if (err) reject(err);
            resolve(this.changes > 0);
        });
    });
};

const removeToken = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET session_token = NULL WHERE user_id = ?';
        db.run(sql, [userId], function(err) {
            if (err) reject(err);
            resolve(this.changes > 0);
        });
    });
};

module.exports = { addNewUser, findUserByEmail, setToken, removeToken, isValidToken };

