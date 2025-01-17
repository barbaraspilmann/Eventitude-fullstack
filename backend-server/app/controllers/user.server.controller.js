const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const secretKey = process.env.JWT_SECRET_KEY || 'your_secret_key';

// Updated schema to disallow extra fields with `unknown(false)`
const addUserSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
        .required(),
}).unknown(false); // Rejects extra fields

const addUser = async (req, res) => {
    // Ensure req.body is either an array or a single object
    const users = Array.isArray(req.body) ? req.body : [req.body];

    try {
        const userIds = []; // To store the IDs of successfully added users

        for (const user of users) {
            // Validate each user individually
            const { error } = addUserSchema.validate(user);
            if (error) {
                return res.status(400).json({ error_message: error.details[0].message });
            }

            // Add the user to the database
            const result = await userModel.addNewUser(user);
            if (result.error) {
                return res.status(400).json({ error_message: result.error });
            }

            // Collect the user ID
            userIds.push(result.userId);
        }

        if (userIds.length === 1) {
            // Single user response
            res.status(201).json({
              message: 'User added successfully',
              user_id: userIds[0],
            });
            
          } else {
            // Multiple users response
            res.status(201).json({
              message: 'Users added successfully',
              user_ids: userIds,
            });
          }
    } catch (err) {
        console.error('Error in addUser:', err);
        res.status(500).json({ error_message: 'Internal server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error_message: 'Email and password are required' });
    }
    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error_message: 'Invalid email/password supplied' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error_message: 'Invalid email/password supplied' });
        }

        const token = jwt.sign({ id: user.user_id }, secretKey, { expiresIn: '1h' });
        await userModel.setToken(user.user_id, token);

        res.status(200).json({ user_id: user.user_id, session_token: token });
    } catch (err) {
        console.error('Error in loginUser:', err);
        res.status(500).json({ error_message: 'Internal server error' });
    }
};

const logoutUser = async (req, res) => {
    const token = req.headers['x-authorization'];
    if (!token) {
        return res.status(401).json({ error_message: 'Unauthorized: Missing token' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        const result = await userModel.removeToken(decoded.id);
        if (!result) {
            return res.status(401).json({ error_message: 'Unauthorized: Invalid token' });
        }
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Error in logoutUser:', err);
        res.status(500).json({ error_message: 'Internal server error' });
    }
};

module.exports = { addUser, loginUser, logoutUser };
