const express = require('express');
const { 
    registerUser, 
    loginUser, 
    logoutUser,
    refreshToken
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware'); // Authorization Middleware (aage banayenge)

const router = express.Router();

// Public Routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser); 

module.exports = router;