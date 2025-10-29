require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 
const userRoutes = require('./routes/userRoutes'); 
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); 
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const noteRoutes = require('./routes/noteRoutes');
const connectDB = require('./config/db');


//dotenv.config();
const app = express();

connectDB();

// 1. Security Middleware (Sabse pehle aana chahiye)
app.use(helmet()); 
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes',
}));
app.use(cors({
    origin: 'http://localhost:5173', // Frontend ka URL
    credentials: true, // Cookies allow karne ke liye
}));

app.use(pinoHttp({ logger }));

// 2. Body Parser 
app.use(express.json());

// 3. Cookie Parser 
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// User authentication routes
app.use('/api/users', userRoutes);

app.use('/api/notes', noteRoutes);

// Agar koi route nahi mila to 404 error
app.use(notFound);

// Har tarah ke errors ko handle karne ke liye
app.use(errorHandler);

const port = process.env.PORT || 5001;   
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
