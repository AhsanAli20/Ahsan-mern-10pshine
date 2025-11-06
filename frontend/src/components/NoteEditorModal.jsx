import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Mark } from '@tiptap/core';
import { 
    X, Save, Tag, Link2, Calendar, Paperclip, 
    Bold, Italic, Strikethrough, List, ListOrdered, 
    Heading1, Heading2, Heading3, Quote, Undo, Redo, Minus, AlertCircle, Code 
} from 'lucide-react';

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

// 💡 Helper function to check if the current background color is DARK
const isColorDark = (hex) => {
    if (hex === '#000000') return true; 
    return false; 
}

// 🎯 COLOR_PALETTE:
const COLOR_PALETTE = [
    { name: 'Default', value: '#000000', lightText: '#ffffff', darkText: '#ffffff' },// Black BG, White Text
    { name: 'Red', value: '#fee2e2', lightText: '#991b1b', darkText: '#fecaca' },
    { name: 'Orange', value: '#fed7aa', lightText: '#9a3412', darkText: '#fed7aa' },
    { name: 'Yellow', value: '#fef3c7', lightText: '#92400e', darkText: '#fef08a' },
    { name: 'Green', value: '#d1fae5', lightText: '#065f46', darkText: '#a7f3d0' },
    { name: 'Blue', value: '#dbeafe', lightText: '#1e40af', darkText: '#bfdbfe' },
    { name: 'Purple', value: '#e9d5ff', lightText: '#6b21a8', darkText: '#d8b4fe' },
    { name: 'Pink', value: '#fce7f3', lightText: '#9f1239', darkText: '#fbcfe8' },
];

const InlineQuote = Mark.create({
    name: 'inlineQuote',
    parseHTML() {
        return [{ tag: 'q' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['q', { class: 'inline-quote' }, 0];
    },
    addCommands() {
        return {
            toggleInlineQuote: () => ({ commands }) => {
                return commands.toggleMark(this.name);
            },
        };
    },
});


const NoteEditorModal = ({ onClose, darkMode, noteToEdit = null, onSave }) => {
    const [title, setTitle] = useState(noteToEdit?.title || '');
    const [categories, setCategories] = useState(noteToEdit?.categories?.join(', ') || '');
    const [hyperlink, setHyperlink] = useState(noteToEdit?.hyperlink || '');
    
    const initialDueDate = noteToEdit?.dueDate 
        ? (noteToEdit.dueDate.split('T')[0] || '') 
        : '';
    const [dueDate, setDueDate] = useState(initialDueDate); 
    
    const [color, setColor] = useState(noteToEdit?.color || COLOR_PALETTE[0].value);
    
    
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [errors, setErrors] = useState({});
    
    const isEditing = !!noteToEdit;

    const currentColorOption = useMemo(() => COLOR_PALETTE.find(c => c.value === color) || COLOR_PALETTE[0], [color]);
    
    const isCurrentBgDark = isColorDark(color);
    const dynamicTextColor = isCurrentBgDark ? 'text-white' : 'text-gray-900';
    
    // Input fields ke liye dynamic styles
    const getInputStyles = () => {
        if (isCurrentBgDark) {
            return 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400';
        } else {
            return 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500';
        }
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                codeBlock: false,
            }),
            Placeholder.configure({
                placeholder: 'Start writing your note here...',
            }),
            InlineQuote,
        ],
        content: noteToEdit?.content || '',
        editorProps: {
            attributes: {
                class: `prose prose-sm max-w-none focus:outline-none p-4 min-h-[20rem] transition-colors whitespace-pre-wrap ${
                    isCurrentBgDark ? 'prose-invert text-white' : 'text-gray-900' 
                }`,
            },
        },
    });
    
    const inputClasses = `w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${getInputStyles()}`;
    
    const isSaveDisabled = !title.trim() || !editor?.getText().trim();

    const ToolbarButton = ({ onClick, isActive, icon: Icon, label }) => (
        <motion.button
            onClick={(e) => { e.preventDefault(); onClick(); }}
            disabled={!editor}
            className={`p-2 rounded-md transition-all ${
                isActive 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : isCurrentBgDark ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            type="button"
            title={label}
            whileTap={{ scale: !editor ? 1 : 0.95 }}
        >
            <Icon className="w-4 h-4" />
        </motion.button>
    );

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Title is required.';
        if (!editor?.getText().trim()) newErrors.content = 'Content cannot be empty.';
        if (hyperlink && !isValidUrl(hyperlink)) newErrors.hyperlink = 'Please enter a valid URL.';
        if (dueDate) {
            const today = new Date().toISOString().split('T')[0];
            if (dueDate < today) {
                newErrors.dueDate = 'Due date cannot be in the past.';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
    if (!validateForm()) return;
    
    // ✅ Strip HTML tags from content for preview
    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };
    
    const noteData = {
        id: noteToEdit?.id || Date.now().toString(),
        title: title.trim(),
        content: editor.getHTML(), // ✅ Full HTML for editing
        plainContent: stripHtml(editor.getHTML()), // ✅ Plain text for display
        categories: categories.split(',').map(cat => cat.trim()).filter(Boolean),
        hyperlink: hyperlink.trim(),
        dueDate: dueDate,
        color: color, // ✅ Yeh correct color bhejega
       
        lastEdited: new Date().toISOString(),
        createdAt: noteToEdit?.createdAt || new Date().toISOString(),
    };

    console.log('📤 Sending Note Data:', noteData);
    
    if (typeof onSave === 'function') {
        onSave(noteData);
    }
    
    onClose();
};

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: color }}
            >
                
                {/* Header */}
                <div className={`p-6 border-b ${isCurrentBgDark ? 'border-gray-600' : 'border-gray-200'} flex items-center justify-between`}>
                    <h2 className={`text-xl font-bold ${dynamicTextColor}`}>
                        {isEditing ? 'Edit Note' : 'Create New Note'}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-all hover:scale-110 ${
                            isCurrentBgDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'
                        } ${dynamicTextColor}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        
                        {/* Title Input */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${dynamicTextColor}`}>
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`${inputClasses} text-lg font-semibold`}
                                style={{ 
                                    color: isCurrentBgDark ? 'white' : '#111827',
                                    backgroundColor: isCurrentBgDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)'
                                }}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.title}
                                </p>
                            )}
                        </div>
                        
                        {/* Toolbar & Editor */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${dynamicTextColor}`}>
                                Content <span className="text-red-500">*</span>
                            </label>
                            {/* Toolbar */}
                            <div className={`flex flex-wrap gap-1 p-3 rounded-t-lg border border-b-0 ${
                                isCurrentBgDark ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-100 border-gray-300'
                            }`} onClick={(e) => e.stopPropagation()}>
                                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor?.isActive('bold')} icon={Bold} label="Bold" />
                                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor?.isActive('italic')} icon={Italic} label="Italic" />
                                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor?.isActive('strike')} icon={Strikethrough} label="Strikethrough" />
                                
                                <div className={`w-px h-6 mx-1 ${isCurrentBgDark ? 'bg-gray-600' : 'bg-gray-400'}`} />
                                
                                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor?.isActive('heading', { level: 1 })} icon={Heading1} label="Heading 1" />
                                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor?.isActive('heading', { level: 2 })} icon={Heading2} label="Heading 2" />
                                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor?.isActive('heading', { level: 3 })} icon={Heading3} label="Heading 3" />
                                
                                <div className={`w-px h-6 mx-1 ${isCurrentBgDark ? 'bg-gray-600' : 'bg-gray-400'}`} />
                                
                                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor?.isActive('bulletList')} icon={List} label="Bullet List" />
                                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor?.isActive('orderedList')} icon={ListOrdered} label="Ordered List" />
                                
                                <ToolbarButton 
                                    onClick={() => editor.chain().focus().toggleInlineQuote().run()} 
                                    isActive={editor?.isActive('inlineQuote')} 
                                    icon={Quote} 
                                    label="Inline Quote" 
                                />
                                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} label="Horizontal Rule" />
                                
                                <div className={`w-px h-6 mx-1 ${isCurrentBgDark ? 'bg-gray-600' : 'bg-gray-400'}`} />

                                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} label="Undo" />
                                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} label="Redo" />
                            </div>
                            
                            {/* Editor Content */}
                            <div className={`rounded-b-lg border ${
                                isCurrentBgDark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-white/80'
                            }`}>
                                <EditorContent editor={editor} />
                            </div>
                            {errors.content && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.content}
                                </p>
                            )}
                        </div>

                        {/* Metadata Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Categories */}
                            <div>
                                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${dynamicTextColor}`}>
                                    <Tag className="w-4 h-4" /> Categories (comma separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="work, personal, ideas"
                                    value={categories}
                                    onChange={(e) => setCategories(e.target.value)}
                                    className={inputClasses}
                                    style={{ 
                                        color: isCurrentBgDark ? 'white' : '#111827',
                                        backgroundColor: isCurrentBgDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)'
                                    }}
                                />
                            </div>

                            {/* Hyperlink */}
                            <div>
                                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${dynamicTextColor}`}>
                                    <Link2 className="w-4 h-4" /> Hyperlink
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={hyperlink}
                                    onChange={(e) => setHyperlink(e.target.value)}
                                    className={inputClasses}
                                    style={{ 
                                        color: isCurrentBgDark ? 'white' : '#111827',
                                        backgroundColor: isCurrentBgDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)'
                                    }}
                                />
                                {errors.hyperlink && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.hyperlink}
                                    </p>
                                )}
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${dynamicTextColor}`}>
                                    <Calendar className="w-4 h-4" /> Due Date
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className={inputClasses}
                                    style={{ 
                                        color: isCurrentBgDark ? 'white' : '#111827',
                                        backgroundColor: isCurrentBgDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)'
                                    }}
                                />
                                {errors.dueDate && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.dueDate}
                                    </p>
                                )}
                            </div>

                            {/* Color Picker */}
                            <div className="relative">
                                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${dynamicTextColor}`}>
                                    <div 
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: color }}
                                    />
                                    Color
                                </label>
                                <button
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    className={`${inputClasses} text-left flex items-center justify-between`}
                                    style={{ 
                                        color: isCurrentBgDark ? 'white' : '#111827',
                                        backgroundColor: isCurrentBgDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <span>Select color</span>
                                    <div 
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: color }}
                                    />
                                </button>

                                <AnimatePresence>
                                    {showColorPicker && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-lg border shadow-lg z-10 grid grid-cols-4 gap-2 ${
                                                isCurrentBgDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                            }`}
                                        >
                                            {COLOR_PALETTE.map((colorOption) => (
                                                <button
                                                    key={colorOption.value}
                                                    onClick={() => {
                                                        setColor(colorOption.value);
                                                        setShowColorPicker(false);
                                                    }}
                                                    className="p-2 rounded-md hover:ring-2 ring-offset-2 ring-offset-transparent ring-emerald-500/50 transition-all flex flex-col items-center gap-1"
                                                    style={{ backgroundColor: colorOption.value }}
                                                    title={colorOption.name}
                                                >
                                                    <div 
                                                        className="w-6 h-6 rounded border border-gray-400"
                                                        style={{ backgroundColor: colorOption.value }}
                                                    />
                                                    <span 
                                                        className="text-xs font-medium"
                                                        style={{ color: isColorDark(colorOption.value) ? colorOption.darkText : colorOption.lightText }}
                                                    >
                                                        {colorOption.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isCurrentBgDark ? 'border-gray-600' : 'border-gray-200'} flex items-center justify-end gap-3`}>
                    
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-xl border transition-all duration-200 text-sm ${
                            isCurrentBgDark 
                                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50 border-gray-600'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-300'
                        }`}
                    >
                        Cancel
                    </button>
                    
                    <button
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all duration-200 text-sm ${
                            isSaveDisabled
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 hover:bg-emerald-500/30'
                        }`}
                    >
                        <Save className="w-4 h-4" />
                        {isEditing ? 'Update Note' : 'Save Note'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NoteEditorModal;