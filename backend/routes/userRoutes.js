const express = require('express');
const { 
    registerUser, 
    loginUser, 
    logoutUser,
    refreshToken,
    getUserProfile,
    forgotPassword, 
    resetPassword 
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware'); // Authorization Middleware (aage banayenge)

const router = express.Router();

// Public Routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser); 
router.get('/profile', protect, getUserProfile); 

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;