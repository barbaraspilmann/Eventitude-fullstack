const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

app.use(limiter);


const HTTP_PORT = 3333;
app.listen(HTTP_PORT, () => {
  console.log(`Server running on port: ${HTTP_PORT}`);
});

app.get('/', (req, res) => res.json({ status: 'Alive' }));

// Routes
require('./app/routes/user.server.routes')(app);
require('./app/routes/event.server.routes')(app);
require('./app/routes/question.server.routes')(app);

// Error Handling Middlewarenpm 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

// Catch-all for unknown routes
app.use((req, res) => res.sendStatus(404));
