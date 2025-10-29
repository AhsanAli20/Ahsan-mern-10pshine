const express = require('express');
const { 
    registerUser, 
    loginUser, 
    logoutUser,
    refreshToken,
    getUserProfile,
    forgotPassword, 
    resetPassword,
    updateUserProfile,
    uploadProfilePicture
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware'); 
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Public Routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser); 
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile); 

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;