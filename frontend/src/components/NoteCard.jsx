import React from 'react';
import { motion } from 'framer-motion';
import { 
    Star, Calendar, Edit, X, Eye, 
    Link, Tags, Clock, Archive
} from 'lucide-react';

const hexToRgb = hex => 
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
       .substring(1).match(/.{2}/g)
       .map(x => parseInt(x, 16));

const getTextColor = (bgColor) => {
    const rgb = hexToRgb(bgColor);
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.65 ? 'text-gray-900' : 'text-white';
};

const NoteCard = ({ note, darkMode, onView, onEdit, onDelete }) => {
    
    if (!note) {
        return (
            <motion.div
                className="rounded-2xl p-6 border border-red-300 bg-red-50 dark:bg-red-900/20 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <p className="text-red-600 dark:text-red-400 font-medium">Error: Note data missing</p>
            </motion.div>
        );
    }

    const { 
        _id = `fallback-${Date.now()}`,
        title = 'Untitled Note', 
        content: plainContent = 'No content available', 
        createdAt = new Date().toISOString(), 
        color = '#ffffff',
        isFeatured = false,
        categories = [], 
        dueDate = null,
        isArchived = false
    } = note;

    const displayDate = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    
    const dynamicTextColorClass = getTextColor(color);
    const dynamicFooterColorClass = dynamicTextColorClass === 'text-white' 
        ? 'border-gray-700/50 text-gray-400' 
        : 'border-gray-200 text-gray-500';

    const cardClasses = color === '#ffffff' || color === '#FFFFFF' 
        ? (darkMode 
            ? "bg-gray-800/80 border-gray-700 hover:bg-gray-700/80" 
            : "bg-white border-gray-200 hover:bg-gray-50")
        : "";
    
    const actionButtonBaseClasses = "p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 shadow-lg text-white";

    return (
        <motion.div
            layout 
            whileHover={{ 
                scale: 1.02, y: -5,
                boxShadow: darkMode 
                    ? "0 20px 40px rgba(0, 198, 167, 0.15)" 
                    : "0 10px 20px rgba(0, 0, 0, 0.05)"
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl p-4 sm:p-6 border relative overflow-hidden group flex flex-col justify-between h-full cursor-pointer ${cardClasses}`}
            style={{ backgroundColor: color, borderColor: dynamicFooterColorClass.includes('700') ? '#374151' : '#E5E7EB' }}
            onClick={() => onView(note)}
        >
            
            {/* Action Buttons Container */}
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
                
                <motion.button
                    onClick={(e) => { e.stopPropagation(); onView(note); }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`${actionButtonBaseClasses} bg-emerald-500 hover:bg-emerald-600`}
                    title="View Note Details"
                >
                    <Eye className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                    onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`${actionButtonBaseClasses} bg-yellow-500/90 hover:bg-yellow-600`}
                    title="Edit Note"
                >
                    <Edit className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                    onClick={(e) => { e.stopPropagation(); onDelete(_id); }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`${actionButtonBaseClasses} bg-red-500/90 hover:bg-red-600`}
                    title="Delete Note"
                >
                    <X className="w-4 h-4" />
                </motion.button>
            </div>
            
            {/* Featured/Archived Badges */}
            <div className="flex justify-between items-center mb-2">
                {isFeatured && (
                    <div className="z-10">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>
                )}
                {isArchived && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                        <Archive className="inline w-3 h-3 mr-1" /> Archived
                    </span>
                )}
            </div>

            {/* Note Content */}
            <div className="flex flex-col h-full">
                <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors line-clamp-2 ${dynamicTextColorClass} mt-1`}>
                    {title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3 flex-1 ${dynamicTextColorClass} opacity-80`}>
                    {plainContent}
                </p>

                {/* Tags/Categories Display */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        <Tags className={`w-3 h-3 mt-0.5 ${dynamicTextColorClass} opacity-60`} />
                        {categories.slice(0, 2).map((tag, index) => (
                            <span 
                                key={index} 
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${dynamicTextColorClass} opacity-80`}
                                style={{ 
                                    backgroundColor: dynamicTextColorClass === 'text-white' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                        {categories.length > 2 && (
                            <span className={`text-xs opacity-60 ${dynamicTextColorClass}`}>
                                +{categories.length - 2} more
                            </span>
                        )}
                    </div>
                )}

                {/* Footer with Date */}
                <div className={`mt-auto pt-3 border-t ${dynamicFooterColorClass}`} style={{ borderColor: dynamicFooterColorClass.includes('700') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{displayDate}</span>
                        </div>
                     {/* <span className="font-semibold text-emerald-400">View Details</span> */}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default NoteCard;