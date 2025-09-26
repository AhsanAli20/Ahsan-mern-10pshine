const User = require('../models/user');
const asyncHandler = require('express-async-handler'); // Simple error handling ke liye (npm install express-async-handler)

// @desc    Register a new user
// @route   POST /api/users/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); // Bad Request
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });

    if (user) {
        const { accessToken } = user.generateAuthTokens(res); // Token generate karke cookie set hogi

        res.status(201).json({ // Created
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken: accessToken, // Access token body mein bhej rahe hain
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const { accessToken } = user.generateAuthTokens(res);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken: accessToken,
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});

// @desc    Logout user / Clear cookies
// @route   POST /api/users/logout
// @access  Private (Aage auth middleware use hoga)
const logoutUser = (req, res) => {
    // Refresh Token cookie ko remove karna hai
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0), // Cookie ko expire kar diya
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Generate new Access Token using Refresh Token
// @route   POST /api/users/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
        res.status(401);
        throw new Error('No refresh token found');
    }

    // Refresh Token ko verify karna
    jwt.verify(refreshTokenFromCookie, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            // Agar token invalid/expired hai, toh unauthorized
            res.status(403); // Forbidden
            throw new Error('Invalid or expired refresh token');
        }

        // Token valid hai, naya access token generate karo
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Naye tokens generate karo aur cookie set karo
        const { accessToken } = user.generateAuthTokens(res);

        res.json({ accessToken });
    });
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken
};