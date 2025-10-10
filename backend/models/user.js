const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Token generation ke liye

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

// --- Middleware: Password Hashing (Save hone se pehle) ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// --- Instance Method: Password Verify Karna ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- Static Method: Access aur Refresh Tokens Generate Karna ---
userSchema.methods.generateAuthTokens = function (res) {
    // 1. ACCESS TOKEN (Short-Lived: e.g., 15 minutes)
    const accessToken = jwt.sign(
        { id: this._id }, // Payload mein sirf ID
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' } 
    );

    // 2. REFRESH TOKEN (Long-Lived: e.g., 7 days)
    const refreshToken = jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' } 
    );
    
    // Refresh Token ko HTTP-Only Cookie mein set karna
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // XSS attacks se bachata hai
        secure: process.env.NODE_ENV === 'production', // HTTPS par hi bhejna
        sameSite: 'strict', // CSRF se bachata hai
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din
    });

    return { accessToken };
};

const User = mongoose.model('User', userSchema);
module.exports = User;