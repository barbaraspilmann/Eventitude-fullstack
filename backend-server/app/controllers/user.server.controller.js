const Joi = require('joi');
const crypto = require('crypto');
const userModel = require('../models/user.model');

// Helper function to hash the password
const getHash = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
};

// Schema for validating user creation requests
const addUserSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

// Add User Function (POST /users)
const addUser = async (req, res) => {
  const { error } = addUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error_message: error.details[0].message });
  }

  try {
    const result = await userModel.addNewUser(req.body);
    if (result.error) {
      return res.status(400).json({ error_message: result.error });
    }
    res.status(201).json({ user_id: result.userId });
  } catch (err) {
    console.error('Error in addUser:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Login User Function (POST /login)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error_message: 'Email and password are required' });
  }

  try {
    // Step 1: Retrieve the user's details from the database
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error_message: 'Invalid email/password supplied' });
    }

    // Step 2: Hash the incoming password with the retrieved salt
    const salt = Buffer.from(user.salt, 'hex'); // Convert the salt back to its original format
    const hashedPassword = getHash(password, salt);

    if (hashedPassword !== user.password) {
      return res.status(400).json({ error_message: 'Invalid email/password supplied' });
    }

    // Step 3: Check for an existing session token
    if (user.session_token) {
      return res.status(200).json({ user_id: user.user_id, session_token: user.session_token });
    }

    // Step 4: Generate a new session token
    const sessionToken = crypto.randomBytes(16).toString('hex');
    await userModel.setToken(user.user_id, sessionToken);

    // Step 5: Return the user ID and session token
    res.status(200).json({ user_id: user.user_id, session_token: sessionToken });
  } catch (err) {
    console.error('Error in loginUser:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

const logoutUser = async (req, res) => {
  // Get the token from the headers
  const token = req.headers['x-authorization'];

  if (!token) {
    return res.status(401).json({ error_message: 'Unauthorized: Missing token' });
  }

  try {
    // Remove the token from the database
    const result = await userModel.removeToken(token);

    if (!result) {
      return res.status(401).json({ error_message: 'Unauthorized: Invalid token' });
    }

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Error in logoutUser:', err);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

// Export functions
module.exports = {
  addUser, // Handles POST /users
  loginUser, // Handles POST /login
  logoutUser, // Handles POST /logout
};

