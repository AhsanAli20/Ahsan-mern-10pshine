import React from 'react';
import { motion } from 'framer-motion';
import { 
    X, Tag, Link2, Calendar, Paperclip, Clock, Trash2, Edit 
} from 'lucide-react';

const isColorDark = (hex) => {
    if (!hex || hex === '#ffffff' || hex === '#FFFFFF') return false;
    if (hex === '#000000') return true;
    
    const rgb = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16));
    
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance < 0.5;
};

const TiptapContentDisplay = ({ htmlContent, textColor }) => {
    const classes = `prose max-w-none p-0 transition-colors ${
        textColor === 'text-white' ? 'prose-invert' : ''
    }`;

    return (
        <div 
            className={classes} 
            style={{ color: textColor === 'text-white' ? '#ffffff' : '#111827' }}
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
    );
};

const NoteViewerModal = ({ note, onClose, onEdit, onDelete, darkMode }) => {
    
    if (!note) return null;

    const {
        title, content, htmlContent, categories, hyperlink, dueDate, color, attachments = [], 
        lastEdited, createdAt 
    } = note;

    const isCurrentBgDark = isColorDark(color);
    const dynamicTextColor = isCurrentBgDark ? 'text-white' : 'text-gray-900';
    const dynamicIconColor = isCurrentBgDark ? 'text-emerald-300' : 'text-emerald-600';
    const dynamicBorderColor = isCurrentBgDark ? 'border-gray-700' : 'border-gray-200';

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Button styles based on background
    const deleteButtonStyle = isCurrentBgDark 
        ? 'bg-red-900/30 text-red-300 border-red-900 hover:bg-red-900/50'
        : 'bg-red-500/10 text-red-600 border-red-300 hover:bg-red-100';
    
    const editButtonStyle = isCurrentBgDark
        ? 'bg-emerald-900/30 text-emerald-300 border-emerald-900 hover:bg-emerald-900/50'
        : 'bg-emerald-500/10 text-emerald-600 border-emerald-300 hover:bg-emerald-100';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: color || '#ffffff' }}
            >
                
                {/* Header */}
                <div className={`p-6 border-b ${dynamicBorderColor} flex items-start justify-between`}>
                    <h2 className={`text-2xl font-extrabold ${dynamicTextColor} pr-4`}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 ml-4 rounded-full transition-all hover:scale-110 flex-shrink-0 ${
                            isCurrentBgDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        } ${dynamicTextColor}`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Main Content */}
                    <div>
                        <h3 className={`text-lg font-semibold mb-3 border-b pb-1 ${dynamicTextColor} ${dynamicBorderColor}`}>
                            Note Content
                        </h3>
                        <TiptapContentDisplay 
                            htmlContent={htmlContent || content} 
                            textColor={dynamicTextColor}
                        />
                    </div>
                    
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        
                        {/* Categories */}
                        {categories && categories.length > 0 && (
                            <div className={`flex items-center gap-3 ${dynamicTextColor}`}>
                                <Tag className={`w-5 h-5 ${dynamicIconColor}`} />
                                <div>
                                    <p className="text-sm font-semibold opacity-70">Categories</p>
                                    <p className="text-base font-medium">
                                        {categories.join(', ')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Hyperlink */}
                        {hyperlink && (
                            <div className={`flex items-center gap-3 ${dynamicTextColor}`}>
                                <Link2 className={`w-5 h-5 ${dynamicIconColor}`} />
                                <div>
                                    <p className="text-sm font-semibold opacity-70">Hyperlink</p>
                                    <a 
                                        href={hyperlink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`text-base font-medium underline hover:opacity-80 transition-opacity ${dynamicIconColor}`}
                                    >
                                        Visit Link
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Created At */}
                        <div className={`flex items-center gap-3 ${dynamicTextColor}`}>
                            <Clock className={`w-5 h-5 ${dynamicIconColor}`} />
                            <div>
                                <p className="text-sm font-semibold opacity-70">Created On</p>
                                <p className="text-base font-medium">
                                    {formatDate(createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Last Edited */}
                        {lastEdited && (
                            <div className={`flex items-center gap-3 ${dynamicTextColor}`}>
                                <Calendar className={`w-5 h-5 ${dynamicIconColor}`} />
                                <div>
                                    <p className="text-sm font-semibold opacity-70">Last Edited</p>
                                    <p className="text-base font-medium">
                                        {formatDate(lastEdited)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                        <div className={`pt-4 border-t ${dynamicBorderColor}`}>
                            <h3 className={`text-lg font-semibold mb-3 ${dynamicTextColor} flex items-center gap-2`}>
                                <Paperclip className="w-5 h-5" /> Attachments ({attachments.length})
                            </h3>
                            <ul className="space-y-2">
                                {attachments.map((file, index) => (
                                    <li key={index} className={`p-3 rounded-lg flex items-center justify-between text-sm ${
                                        isCurrentBgDark ? 'bg-gray-800/50 text-white' : 'bg-gray-100/50 text-gray-800'
                                    }`}>
                                        <span className="truncate">{file.name}</span>
                                        <span className="font-mono text-xs opacity-70">
                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer with Actions */}
                <div className={`p-6 border-t ${dynamicBorderColor} flex justify-end gap-4`}>
                    <motion.button
                        onClick={onDelete}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 text-sm flex items-center gap-2 font-medium border ${deleteButtonStyle}`}
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </motion.button>
                    <motion.button
                        onClick={onEdit}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 text-sm flex items-center gap-2 font-medium border ${editButtonStyle}`}
                    >
                        <Edit className="w-4 h-4" /> Edit Note
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NoteViewerModal;