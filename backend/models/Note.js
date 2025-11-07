const mongoose = require('mongoose');

// Custom URL validation function
const validateURL = (url) => {
    if (!url) return true; // Optional field
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'] // 200 se 100 kiya for better display
    },
    content: {
        // Rich Text content will be a large HTML string
        type: String, 
        required: [true, 'Content is required'],
        maxlength: [10000, 'Content cannot exceed 10000 characters'] // Max length increase kiya Rich Text ke liye
    },
    
    // --- NEW FIELDS FROM NOTE EDITOR MODAL ---
    color: {
        type: String,
        default: '#ffffff', // Default white/no color
        trim: true
    },
    categories: [{ // Replaced 'category' enum and merged with 'tags'
        type: String,
        trim: true
    }],
    hyperlink: {
        type: String,
        trim: true,
        validate: {
            validator: validateURL,
            message: props => `${props.value} is not a valid URL!`
        }
    },
    dueDate: {
        type: Date,
        default: null
    },
    attachments: [{ 
        // File meta-data storage. Upload logic will use Multer/Cloudinary.
        fileId: { type: String, required: true },
        fileName: { type: String, required: true },
        mimeType: { type: String },
        size: { type: Number }
    }],
    isDraft: { // Save as Draft functionality
        type: Boolean,
        default: false
    },
    // --- EXISTING FIELDS ADJUSTED ---
    isFeatured: { 
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    }
    // 'tags' field is replaced by 'categories'
}, {
    timestamps: true,
    collection: 'notes'
});

// Compound indexes (Optimized for user queries and sorting by date)
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, isDraft: 1 }); 
noteSchema.index({ user: 1, isFeatured: -1, createdAt: -1 }); 

module.exports = mongoose.model('Note', noteSchema);