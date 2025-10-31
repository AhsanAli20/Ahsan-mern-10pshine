const asyncHandler = require('express-async-handler');
const Note = require('../models/Note'); 
const User = require('../models/user'); 
const logger = require('../utils/logger'); 

// Utility function to process categories string into an array
const processCategories = (categoriesString) => {
    if (!categoriesString) return [];
    // Comma, space, or semicolon se split karein, trim karein, aur empty strings remove karein
    return categoriesString
        .split(/[,\s;]+/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
};

const getNotes = asyncHandler(async (req, res) => {
    // Ab hum Drafts aur Archived ko filter kar sakte hain, lekin abhi default all notes de rahe hain.
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    logger.info({ userId: req.user._id, count: notes.length }, 'Fetched all user notes');
    res.status(200).json(notes);
});

const createNote = asyncHandler(async (req, res) => {

    const { 
        title, 
        content, 
        color, 
        categories: categoriesString, 
        hyperlink, 
        dueDate, 
        isDraft,
        isFeatured,
        isArchived
       
    } = req.body; 

    const userId = req?.user?._id;
    
    if (!title || !content) {
        res.status(400);
        throw new Error('Please include both title and content for the note.');
    }

    try {
        
        const categoriesArray = processCategories(categoriesString);

        const note = await Note.create({
            user: userId,
            title,
            content,
            // 💡 NEW FIELDS: Add kar rahe hain
            color: color || '#ffffff', 
            categories: categoriesArray,
            hyperlink: hyperlink || null,
            dueDate: dueDate || null,
            isDraft: isDraft || false,
            isFeatured: isFeatured || false,
            isArchived: isArchived || false,
            // attachments: uploadedAttachments // uncomment after Cloudinary setup
        });

        logger.info({ userId: req.user._id, noteId: note._id }, 'New note created successfully');
        
        res.status(201).json({
            message: 'Note created successfully',
            note: note,
        });

    } catch (error) {
        logger.error({ error: error.message, name: error.name, stack: error.stack }, 'Mongoose Note Create Failed!');
        res.status(500);
        throw new Error(`Note creation failed due to database error: ${error.message}`); 
    }
});

const getNoteById = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (note) {
        if (note.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to view this note');
        }
        res.status(200).json(note);
    } else {
        res.status(404);
        throw new Error('Note not found');
    }
});


const updateNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    if (note.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this note');
    }

    //UPDATE LOGIC: req.body ko seedha pass karne se pehle categories ko process karein
    const updateFields = { ...req.body };
    
    if (updateFields.categories) {
        updateFields.categories = processCategories(updateFields.categories);
    }
    const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        updateFields, // Updated fields with processed categories
        {
            new: true,
            runValidators: true,
        }
    );

    logger.info({ userId: req.user._id, noteId: updatedNote._id }, 'Note updated successfully');

    res.status(200).json({
        message: 'Note updated successfully',
        note: updatedNote,
    });
});

const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    if (note.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this note');
    }

    await Note.deleteOne({ _id: req.params.id });

    logger.warn({ userId: req.user._id, noteId: req.params.id }, 'Note deleted');

    res.status(200).json({ message: 'Note removed successfully' });
});

module.exports = {
    getNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
};