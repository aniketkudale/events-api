const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

// Routes
const events = require('./routes/events');
const auth = require('./routes/auth');
const users = require('./routes/users');

dotenv.config({ path: './config/config.env'});

connectDB();

const app = express();

// Body PArser
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.use(fileUpload());

// Sanitize data
app.use(mongoSanitize());

// Set Security Headers
app.use(helmet());

// Prevent XSS attacks
app.use(xssClean());

// Rate Limiting

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1
});

app.use(limiter);
app.use(hpp());

// Enable cors
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mouting the routes
app.use('/api/v1/events', events);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);

// Error handlers
app.use(errorHandler);



const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT} on ${process.env.NODE_ENV}!`.yellow.bold);
});

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
