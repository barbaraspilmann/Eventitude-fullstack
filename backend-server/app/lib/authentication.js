const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const secretKey = process.env.JWT_SECRET_KEY || 'your_secret_key';

const authenticate = async (req, res, next) => {
    try {
        // Log the incoming request headers for debugging
        console.log('Request Headers:', req.headers);

        // Changed to 'x-authorization' to match normalized header keys
        const sessionToken = req.headers['x-authorization'];
        console.log('Session Token:', sessionToken); // Log the extracted token

        if (!sessionToken) {
            console.warn('Unauthorized: Missing token'); // Warn if token is missing
            return res.status(401).json({ error_message: 'Unauthorized: Missing token' });
        }

        // Verify the JWT token
        const decoded = jwt.verify(sessionToken, secretKey);
        console.log('Decoded JWT:', decoded); // Log decoded token payload

        // Check if the token is valid in the database
        const isValidToken = await userModel.isValidToken(decoded.id, sessionToken);
        console.log('Is Valid Token:', isValidToken); // Log token validation result

        if (!isValidToken) {
            console.warn('Unauthorized: Invalid or expired token'); // Warn if token is invalid
            return res.status(401).json({ error_message: 'Unauthorized: Invalid or expired token' });
        }

        // Attach user ID to the request object for downstream middleware/routes
        req.userId = decoded.id;

        console.log(`User ${decoded.id} authenticated successfully`); // Success log
        next();
    } catch (err) {
        console.error('Authentication error:', err.message || err); // Log unexpected errors
        res.status(401).json({ error_message: 'Unauthorized: Invalid or expired token' });
    }
};

module.exports = authenticate;
