// Import necessary modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');


// Initialize the Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up logging to a file
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 900, //low each IP to make 200 requests per windowMs
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Health check endpoint
app.get('/', (req, res) => res.json({ status: 'Alive' }));

// Routes
require('./app/routes/user.server.routes')(app);
require('./app/routes/event.server.routes')(app);
require('./app/routes/question.server.routes')(app);
require('./app/routes/event.server.routes')(app);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error.' });
});

// Catch-all for unknown routes
app.use((req, res) => res.sendStatus(404));

// Server initialization
const HTTP_PORT = 3333;
app.listen(HTTP_PORT, () => {
    console.log(`Server running on port: ${HTTP_PORT}`);
});
