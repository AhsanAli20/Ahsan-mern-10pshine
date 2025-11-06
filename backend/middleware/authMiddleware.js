const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user'); // User model zaroori hai

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check karein ke header mein 'Authorization' maujood hai ya nahi
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 1. Access Token ko headers se nikalna
            // Token ka format hota hai: "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // 2. Token ko verify karna
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            // 3. Token se user ki ID nikal kar database se user data fetch karna
            // Password ko remove karna (select('-password')) zaroori hai
            req.user = await User.findById(decoded.id).select('-password');
            
            // Agar sab theek hai, to agle function (route handler) par jane dega
            next();
        } catch (error) {
            console.error(error);
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401); // Unauthorized
        throw new Error('Not authorized, no token');
    }
});

module.exports = protect;