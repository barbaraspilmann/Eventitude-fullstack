const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key'; // Replace with a secure secret key.

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers['x-authorization'];
    if (!token) {
      return res.status(401).json({ error_message: 'Unauthorized: Missing token' });
    }

    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.id; // Attach decoded user ID to the request object.
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ error_message: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = authenticate;
