const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
// Crypto ko import karen, yeh Node.js ka built-in module hai
const crypto = require('crypto'); 

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // --- NEW FIELDS FOR PASSWORD RESET ---
    passwordResetToken: String,
    passwordResetExpires: Date,
    // ------------------------------------

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

// --- Instance Method: Access aur Refresh Tokens Generate Karna (FIXED) ---
userSchema.methods.generateAuthTokens = function (res, rememberMe = false) {
    // Expiry calculation
    const longExpiry = 30 * 24 * 60 * 60 * 1000; // 30 days
    const shortExpiry = 1 * 24 * 60 * 60 * 1000; // 1 day
    const cookieMaxAge = rememberMe ? longExpiry : shortExpiry;
    const tokenExpiresIn = rememberMe ? '30d' : '1d'; // JWT expiry for refresh token

    // 1. ACCESS TOKEN (Short-Lived: e.g., 15 minutes)
    const accessToken = jwt.sign(
        { id: this._id }, 
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' } 
    );

    // 2. REFRESH TOKEN (Dynamic Expiry)
    const refreshToken = jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: tokenExpiresIn } // Token ki internal expiry dynamic ki
    );
    
    // Refresh Token ko HTTP-Only Cookie mein set karna
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: cookieMaxAge, // Cookie ki expiry dynamic ki
    });

    return { accessToken };
};

// --- NEW Instance Method: Password Reset Token Generate Karna ---
userSchema.methods.getResetPasswordToken = function () {
    // 1. 32-byte (256-bit) random string generate karna
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Iss token ko hash karke database mein save karna
    // Taake agar database leak ho bhi jaaye, toh asal token hack na ho.
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Reset token ki expiry time set karna (e.g., 1 hour from now)
    // Date.now() + (60 minutes * 60 seconds * 1000 milliseconds)
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000; 

    // 4. Unhashed token wapas karna (jo email link mein use hoga)
    // Ye wohi token hai jo frontend ko milega.
    return resetToken;
};


const User = mongoose.model('User', userSchema);
module.exports = User;