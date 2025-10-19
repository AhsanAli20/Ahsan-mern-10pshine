const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // Security Headers
const rateLimit = require('express-rate-limit'); // DDoS/Brute Force se bachata hai
const userRoutes = require('./routes/userRoutes'); // User Routes import kiye
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); // Error Handlers (aage banaenge)
const cors = require('cors');


dotenv.config();
const app = express();

// 1. Security Middleware (Sabse pehle aana chahiye)
app.use(helmet()); 
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Har IP se 15 minute mein 100 requests ki limit
    message: 'Too many requests from this IP, please try again after 15 minutes',
}));
app.use(cors({
    origin: 'http://localhost:5173', // Frontend ka URL
    credentials: true, // Cookies allow karne ke liye
}));

// 2. Body Parser (JSON data ko parse karne ke liye)
app.use(express.json());

// 3. Cookie Parser (Request se cookies nikalne ke liye)
app.use(cookieParser());



app.get('/', (req, res) => {
  res.send('Hello World!')
})

// User authentication routes
app.use('/api/users', userRoutes);

// ------------------- ERROR HANDLING -------------------

// Agar koi route nahi mila to 404 error
app.use(notFound);

// Har tarah ke errors ko handle karne ke liye
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("connected to mongoDB");
})
.catch((err) => {
    console.log(err);
})

const port = process.env.PORT || 5001;   
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
