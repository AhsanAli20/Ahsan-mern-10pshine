import React from 'react';
import { motion } from 'framer-motion';
import { 
    Star, Calendar, Clock, Edit, X 
} from 'lucide-react';

const NoteCard = ({ title, content, date, isFeatured, darkMode }) => {
    // Placeholder functions for Edit and Delete
    const handleEdit = () => console.log(`Editing note: ${title}`);
    const handleDelete = () => console.log(`Deleting note: ${title}`);

    // Dynamic classes based on darkMode
    const cardClasses = darkMode 
        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" 
        : "bg-white from-gray-100 to-white border-gray-200 shadow-md";
    
    const titleClasses = darkMode 
        ? "text-white group-hover:text-emerald-400" 
        : "text-gray-900 group-hover:text-emerald-600";
        
    const contentClasses = darkMode 
        ? "text-gray-400" 
        : "text-gray-600";
        
    const footerClasses = darkMode 
        ? "border-gray-700/50 text-gray-500" 
        : "border-gray-200 text-gray-400";
        
    const buttonHoverColor = darkMode ? '#34d399' : '#059669'; // Light mode par dark emerald

    return (
        <motion.div
            whileHover={{ 
                scale: 1.02,
                y: -5,
                boxShadow: darkMode 
                    ? "0 20px 40px rgba(0, 198, 167, 0.15)" 
                    : "0 10px 20px rgba(0, 0, 0, 0.05)"
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl p-4 sm:p-6 cursor-pointer border relative overflow-hidden group flex flex-col justify-between h-full ${cardClasses}`}
        >
            {/* Shine Effect (Only visible in Dark Mode) */}
            {darkMode && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            )}
            
            {isFeatured && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                </div>
            )}
            
            <div>
                <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors line-clamp-2 ${titleClasses}`}>
                    {title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3 ${contentClasses}`}>
                    {content}
                </p>
            </div>

            {/* Footer with Date/Time and Action Buttons */}
            <div className={`mt-3 pt-3 border-t ${footerClasses}`}>
                <div className="flex items-center justify-between text-xs mb-2 sm:mb-3">
                    <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{date}</span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-1"> 
                        <Clock className="w-3 h-3" />
                        <span>5 min read</span>
                    </div>
                </div>

                {/* Edit and Delete Buttons */}
                <div className="flex justify-end space-x-2 sm:space-x-3">
                    <motion.button
                        onClick={handleEdit}
                        whileHover={{ scale: 1.1, color: buttonHoverColor }}
                        whileTap={{ scale: 0.9 }}
                        className={`hover:text-emerald-400 transition-colors flex items-center text-xs sm:text-sm font-medium p-1 ${darkMode ? 'text-gray-500' : 'text-gray-500 hover:text-emerald-600'}`}
                    >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                    </motion.button>
                    <motion.button
                        onClick={handleDelete}
                        whileHover={{ scale: 1.1, color: '#ef4444' }}
                        whileTap={{ scale: 0.9 }}
                        className={`hover:text-red-500 transition-colors flex items-center text-xs sm:text-sm font-medium p-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}
                    >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default NoteCard;