const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const sendEmail = require('../utils/emailUtils');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const {cloudinary} = require('../config/cloudinary');  

// @route   POST /api/users/signup
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); 
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });

    if (user) {
        const { accessToken } = user.generateAuthTokens(res); 

        res.status(201).json({ 
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken: accessToken, 
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @route   POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body; 

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const { accessToken } = user.generateAuthTokens(res, rememberMe); 

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken: accessToken,
        });
    } else {
        res.status(401); 
        throw new Error('Invalid email or password');
    }
});

// @route   POST /api/users/logout
const logoutUser = (req, res) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0), 
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @route   POST /api/users/refresh
const refreshToken = asyncHandler(async (req, res) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
        res.status(401);
        throw new Error('No refresh token found');
    }

    jwt.verify(refreshTokenFromCookie, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            res.status(403); 
            throw new Error('Invalid or expired refresh token');
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const { accessToken } = user.generateAuthTokens(res);

        res.json({ accessToken });
    });
});

// @route   GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password'); 

    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.profilePicture = req.body.profilePicture || user.profilePicture;
        console.log(req.body.profilePicture);

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            createdAt: updatedUser.createdAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @route   POST /api/users/forgotpassword
const forgotPassword = asyncHandler(async (req, res) => {
    console.log("🔥 FRONTEND_URL:", FRONTEND_URL);
    console.log("🔥 process.env.FRONTEND_URL:", process.env.FRONTEND_URL);
    
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json({ 
            message: 'If a user with that email exists, a password reset link has been sent.' 
        });
    }

    const resetToken = user.getResetPasswordToken();

    console.log("================== FORGOT PASSWORD ==================");
    console.log("Plain resetToken (jo email mein jayega):", resetToken);
    console.log("Hashed token (DB mein save hogi):", user.passwordResetToken);
    console.log("Token expires at:", new Date(user.passwordResetExpires));
 

    await user.save({ validateBeforeSave: false });

    const resetURL = `${FRONTEND_URL}/reset-password/${resetToken}`;
    
    const message = `Aapke password reset ki darkhwast (request) aayi hai. Apne password ko reset karne ke liye is link par click karen:\n\n${resetURL}\n\nYeh link sirf 1 ghante ke liye valid hai.\n\nAgar aapne yeh request nahi ki hai, to is email ko ignore karen.`;
    
    const htmlMessage = `
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
            
            <h2 style="color: #333333; text-align: center;">🔐 Password Reset Request</h2>
            
            <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                Salam! Aapke password reset ki darkhwast aayi hai.
            </p>
            
            <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                Apne password ko reset karne ke liye neeche diye gaye button par click karen:
            </p>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                    <td align="center">
                        <a href="${resetURL}" 
                        style="background-color: #9333ea; 
                                color: #ffffff; 
                                padding: 14px 35px; 
                                text-decoration: none; 
                                border-radius: 6px; 
                                font-weight: bold; 
                                font-size: 16px; 
                                display: inline-block;
                                text-align: center;">
                            🔓 Reset Password
                        </a>
                    </td>
                </tr>
            </table>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
            
            <p style="color: #999999; font-size: 14px;">
                Ya phir is link ko copy karke browser mein paste karen:
            </p>
            
            <p style="background-color: #f7f7f7; 
                    padding: 12px; 
                    border-radius: 5px; 
                    word-break: break-all; 
                    font-size: 13px; 
                    border: 1px dashed #cccccc;">
                <a href="${resetURL}" style="color: #9333ea; text-decoration: none;">${resetURL}</a>
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #ff6b6b; font-size: 13px; margin: 5px 0;">
                    ⏰ <strong>Important:</strong> Yeh link sirf <strong>1 ghante</strong> ke liye valid hai.
                </p>
                
                <p style="color: #999999; font-size: 12px; margin: 5px 0;">
                    ⚠️ Agar aapne yeh request nahi ki, to is email ko ignore karen.
                </p>
                
                <p style="color: #cccccc; font-size: 11px; margin-top: 15px;">
                    © Note App System
                </p>
            </div>
            
        </div>
    </body>
    </html>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: message,
            html: htmlMessage, 
        });

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to email.',
        });

    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500);
        throw new Error(`Email could not be sent. Please check your SMTP settings. Error: ${error.message}`);
    }
});

// @route   PUT /api/users/resetpassword/:token
const resetPassword = asyncHandler(async (req, res) => {

    console.log(" 1. Token from URL:", req.params.token);
    
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    console.log(" 2. Hashed token (search ke liye):", hashedToken);
    console.log("3. Current time:", new Date(Date.now()));

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    
    console.log("🔍 4. User found:", user ? "YES" : "NO");

    if (user) {
        console.log(" User email:", user.email);
        console.log("Token in DB:", user.passwordResetToken);
        console.log("Token expires at:", new Date(user.passwordResetExpires));
        console.log("Time remaining:", Math.floor((user.passwordResetExpires - Date.now()) / 1000 / 60), "minutes");
    }
    console.log("===================================================");

    if (!user) {
        res.status(400);
        throw new Error('Password reset token is invalid or has expired.');
    }

    if (req.body.password !== req.body.confirmPassword) {
        res.status(400);
        throw new Error('Password and Confirm Password do not match.');
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
    });
});
const uploadProfilePicture = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }

        // Get user
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // If user already has a profile picture, delete old one from Cloudinary
        if (user.profilePicture && user.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(user.cloudinaryPublicId);
        }

        // Update user with new profile picture URL and public ID
        user.profilePicture = req.file.path; // Cloudinary URL
        user.cloudinaryPublicId = req.file.filename; // Public ID for deletion

        await user.save();

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profilePicture
        });

    } catch (error) {
        res.status(500);
        throw new Error(`Upload failed: ${error.message}`);
    }
});


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    uploadProfilePicture
};