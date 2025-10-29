import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

// Import components
import NoteCard from './NoteCard'; 
import NoteEditorModal from './NoteEditorModal';
import NoteViewerModal from './NoteViewerModal';
import ProfileModal from './ProfileModal';
import { 
    Menu, Search, Home, Folder, User, LogOut, 
    Moon, Sun, Plus, BookOpen, 
    ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';

// Utility function to strip HTML
const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

// TextSlider Component
const TextSlider = () => {
    const texts = [
        "Hi,",
        "📝 Write Your Important Note",
        "Here!"
    ];
    
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % texts.length);
        }, 3000); 
        return () => clearInterval(interval);
    }, [texts.length]); 

    return (
        <div className="flex items-center justify-center space-x-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full px-3 py-1 sm:px-6 sm:py-3 border border-emerald-500/20">
            <div className="h-5 sm:h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={currentIndex}
                        initial={{ x: -20, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-emerald-400 font-semibold text-sm sm:text-lg block whitespace-nowrap"
                    >
                        {texts[currentIndex]}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768); 
    const [activeNav, setActiveNav] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [noteToView, setNoteToView] = useState(null);
    const [noteToEdit, setNoteToEdit] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    const { logout } = useAuth(); 
    const navigate = useNavigate();

    // Fetch user profile
    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Fetch notes on component mount
    useEffect(() => {
        fetchNotes();
    }, []);

    // Fetch user profile
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch('http://localhost:5001/api/users/profile', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUserProfile(data);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    // Fetch all notes from backend
    const fetchNotes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                console.error('No token found');
                setLoading(false);
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5001/api/notes', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                const transformedNotes = data.map(note => ({
                    _id: note._id,
                    id: note._id,
                    title: note.title,
                    content: stripHtml(note.content),
                    htmlContent: note.content,
                    date: new Date(note.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                    }),
                    createdAt: note.createdAt,
                  //  isFeatured: note.isFeatured || false,
                    category: note.category || 'General',
                    categories: note.category ? [note.category] : [],
                    color: note.color || '#ffffff',
                    hyperlink: note.hyperlink || '',
                    dueDate: note.dueDate || '',
                    attachments: note.attachments || []
                }));
                
                setNotes(transformedNotes);
            } else {
                console.error('Failed to fetch notes:', data);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setNoteToEdit(null); 
        setIsModalOpen(true);
    };

    const handleViewNote = (note) => {
        setNoteToView(note);
        setIsViewerOpen(true);
    };

    // ✅ FIX: Pass full note object to editor
    const handleEditNote = (note) => {
        console.log('✏️ Editing note:', note);
        
        const noteDataForEditor = {
            id: note._id || note.id,
            title: note.title,
            content: note.htmlContent || note.content,
            categories: note.categories || [note.category],
            color: note.color,
            hyperlink: note.hyperlink || '',
            dueDate: note.dueDate ? note.dueDate.split('T')[0] : '',
            createdAt: note.createdAt
        };          
        setNoteToEdit(noteDataForEditor);
        setIsViewerOpen(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNoteToEdit(null);
    };

    const handleCloseViewer = () => {
        setIsViewerOpen(false);
        setNoteToView(null);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
    };

    // Save/Update note handler
    const handleSaveNote = async (noteData) => {
        console.log('💾 Saving Note:', noteData);

        try {
            const token = localStorage.getItem('accessToken');
            const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(noteData.id);
            const method = isValidMongoId ? 'PUT' : 'POST';
            const url = isValidMongoId
                ? `http://localhost:5001/api/notes/${noteData.id}` 
                : 'http://localhost:5001/api/notes';
            
            if (!token) {
                alert('Please login again');
                navigate('/login');
                return;
            }

            const requestBody = {
                title: noteData.title,
                content: noteData.content, 
                category: noteData.categories[0] || 'General',
                color: noteData.color,
                hyperlink: noteData.hyperlink || null,
                dueDate: noteData.dueDate || null,
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok) {
                const savedNote = data.note || data.updatedNote;
                
                const transformedNote = {
                    _id: savedNote._id,
                    id: savedNote._id,
                    title: savedNote.title,
                    content: stripHtml(savedNote.content),
                    htmlContent: savedNote.content,
                    createdAt: savedNote.createdAt,
                    date: new Date(savedNote.updatedAt || savedNote.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                    }),
                  //  isFeatured: savedNote.isFeatured || false,
                    category: savedNote.category || 'General',
                    categories: [savedNote.category || 'General'],
                    color: savedNote.color || '#ffffff',
                    hyperlink: savedNote.hyperlink || '',
                    dueDate: savedNote.dueDate || '',
                    attachments: savedNote.attachments || []
                };

                if (isValidMongoId) {
                    setNotes(prevNotes => 
                        prevNotes.map(note => 
                            note._id === transformedNote._id ? transformedNote : note
                        )
                    );
                    alert('✅ Note updated successfully!');
                } else {
                    setNotes(prevNotes => [transformedNote, ...prevNotes]);
                    alert('✅ Note created successfully!');
                }
                
                handleCloseModal();
            } else {
                console.error('❌ Server error:', data);
                alert(`Error: ${data.message || 'Failed to save note'}`);
            }

        } catch (error) {
            console.error('❌ Network Error:', error);
            alert('Network error. Please try again.');
        }
    };
    
    const handleDeleteNote = async (noteId) => {
        if (!noteId) {
            alert('Error: Note ID is missing');
            return;
        }

        if (!window.confirm("Are you sure you want to delete this note?")) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Please login again');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5001/api/notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
                setIsViewerOpen(false);
                alert('🗑️ Note deleted successfully!');
            } else {
                const data = await response.json();
                alert(`Error: ${data.message || 'Failed to delete note'}`);
            }
        } catch (error) {
            console.error('❌ Network Error:', error);
            alert('Network error during deletion.');
        }
    };

    const handleLogout = () => {
        logout(); 
        navigate('/login');
    };

    const handleNavigation = (navId) => {
        setActiveNav(navId);
        if (navId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (navId === 'notes') {
            const notesSection = document.getElementById('notes-section');
            notesSection?.scrollIntoView({ behavior: 'smooth' });
        } else if (navId === 'profile') {
            setIsProfileOpen(true);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true); 
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { icon: Home, label: 'Home', id: 'home', action: () => handleNavigation('home') },
        { icon: Folder, label: 'Notes', id: 'notes', action: () => handleNavigation('notes') },
        { icon: BookOpen, label: 'Blog', id: 'blog', action: () => handleNavigation('blog') }, 
        { icon: User, label: 'Profile', id: 'profile', action: () => handleNavigation('profile') },
        { icon: LogOut, label: 'Exit', id: 'exit', action: handleLogout }, 
    ];
    
    const bottomNavItems = navItems.slice(0, 4);

    const sidebarVariants = {
        open: { width: 280, x: 0, transition: { duration: 0.3 } }, 
        closed: { width: 80, x: 0, transition: { duration: 0.3 } } 
    };

    const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
    const sidebarBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const headerBg = darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/90 border-gray-200';
    const bottomNavBg = darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'; 
    const textBase = darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
            <div className="flex min-h-screen overflow-hidden"> 
                
                {/* SIDEBAR */}
                <motion.div
                    className={`${sidebarBg} flex-col relative transition-all duration-300 z-50 md:flex hidden md:static fixed top-0 bottom-0 overflow-y-auto border-r`}
                    initial="closed" 
                    animate={sidebarOpen ? "open" : "closed"}
                    variants={sidebarVariants}
                >
                    <motion.button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`absolute right-[-10px] sm:-right-3 top-4 sm:top-8 rounded-full p-1 sm:p-2 transition-colors z-10 hidden md:block ${
                            darkMode ? 'bg-gray-700 hover:bg-emerald-600' : 'bg-gray-200 hover:bg-emerald-500 border border-gray-300'
                        }`}
                    >
                        {sidebarOpen 
                            ? <ChevronLeft className={`w-3 h-3 sm:w-4 sm:h-4 ${darkMode ? 'text-white' : 'text-gray-900'}`} /> 
                            : <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 ${darkMode ? 'text-white' : 'text-gray-900'}`} />}
                    </motion.button>

                    {/* Logo - Clickable */}
                    <div className={`p-4 sm:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer`} onClick={() => handleNavigation('home')}>
                        <motion.div className="flex items-center space-x-3">
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg sm:text-xl">N</span>
                            </div>
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className={`font-bold text-xl sm:text-2xl ${textBase}`}
                                    >
                                        NoteApp
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 p-2 sm:p-4 space-y-1 sm:space-y-2">
                        {navItems.map((item, index) => (
                            <motion.button
                                key={item.id}
                                onClick={item.action} 
                                className={`w-full flex items-center space-x-3 p-2 sm:p-3 rounded-xl transition-all duration-200 text-sm ${
                                    activeNav === item.id 
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                                        : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <AnimatePresence>
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="font-medium whitespace-nowrap overflow-hidden"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer hover:bg-gray-700/30 transition-colors`} onClick={() => setIsProfileOpen(true)}>
                        <div className="flex items-center space-x-3">
                            <img 
                                src={userProfile?.profilePicture || "null"} 
                                alt="Profile" 
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500"
                            />
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex-1 min-w-0"
                                    >
                                        <p className={`font-medium text-xs sm:text-sm truncate ${textBase}`}>
                                            {userProfile?.name || 'Loading...'}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
                
                {/* MAIN CONTENT */}
                <div className="flex-1 overflow-auto pb-20 md:pb-0"> 
                    
                    {/* Header */}
                    <header className={`${headerBg} backdrop-blur-lg sticky top-0 z-40 border-b`}>
                        <div className="px-4 py-3 sm:px-8 sm:py-4">
                            <div className="flex items-center justify-between">
                                <motion.div 
                                    className={`hidden sm:flex items-center space-x-2 ${textSecondary}`}
                                >
                                    <Home className="w-4 h-4" />
                                    <span>/</span>
                                    <span className={`capitalize ${textBase}`}>{activeNav}</span>
                                </motion.div>
                                <TextSlider />
                                <div className="flex items-center space-x-2 sm:space-x-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setDarkMode(!darkMode)}
                                        className={`flex items-center space-x-2 rounded-full p-2 sm:px-4 sm:py-2 transition-colors ${
                                            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                        }`}
                                    >
                                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        <span className="text-sm hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="p-4 sm:p-8">
                        
                        {/* Welcome Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 sm:mb-8"
                        >
                            <h1 className={`text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 ${textBase}`}>
                                Welcome back, {userProfile?.name || 'User'}! 👋
                            </h1>
                            <p className={`text-sm sm:text-lg ${textSecondary}`}>
                                You have {notes.length} notes. 
                            </p>
                        </motion.div>

                        {/* Search and Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0" 
                        >
                            
                            {/* Search Bar */}
                            <div className="relative w-full sm:w-96">
                                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
                                <input
                                    type="text"
                                    placeholder="Search your notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-12 pr-12 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-sm ${
                                        darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                />
                                <Menu className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer ${textSecondary}`} />
                            </div>

                            {/* New Note Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOpenModal}
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-xl flex items-center space-x-2 shadow-lg transition-all duration-200 text-sm"
                            >
                                <Plus className="w-5 h-5" />
                                <span>New Note</span>
                            </motion.button>
                        </motion.div>

                        {/* Notes Grid Section */}
                        <div id="notes-section">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <p className={`text-xl ${textSecondary} mb-4`}>No notes yet</p>
                                    <p className={`text-sm ${textSecondary}`}>Click "New Note" to create your first note</p>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                                >
                                    <AnimatePresence>
                                        {notes
                                            .filter(note => {
                                                if (!note) return false;
                                                return (
                                                    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
                                                );
                                            })
                                            .map((note) => {
                                                if (!note) return null;
                                                
                                                const uniqueKey = note._id || note.id || `note-${Math.random()}`;
                                                
                                                return (
                                                    <NoteCard 
                                                        key={uniqueKey} 
                                                        note={note}
                                                        darkMode={darkMode} 
                                                        onView={() => handleViewNote(note)}
                                                        onEdit={() => handleEditNote(note)}
                                                        onDelete={() => handleDeleteNote(note._id)}
                                                    />
                                                );
                                            })
                                        }
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </div>
                    </main>
                </div>

                {/* MOBILE BOTTOM NAVIGATION */}
                <motion.nav
                    className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${bottomNavBg} backdrop-blur-md border-t px-2 py-2`}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
                >
                    <div className="flex justify-around items-center">
                        {bottomNavItems.map((item) => (
                            <motion.button
                                key={`mobile-${item.id}`}
                                onClick={item.action} 
                                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-xs ${
                                    activeNav === item.id 
                                        ? 'text-emerald-500 font-semibold' 
                                        : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                                }`}
                                whileTap={{ scale: 0.9 }}
                            >
                                <item.icon className="w-5 h-5 mb-0.5" />
                                <span className="text-xs">{item.label}</span>
                            </motion.button>
                        ))}
                        <motion.button
                            key={`mobile-exit`}
                            onClick={handleLogout}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-xs ${
                                darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                            }`}
                            whileTap={{ scale: 0.9 }}
                        >
                            <LogOut className="w-5 h-5 mb-0.5" />
                            <span className="text-xs">Exit</span>
                        </motion.button>
                    </div>
                </motion.nav>
            </div>
            
            {/* MODALS */}
            <AnimatePresence>
                {isModalOpen && (
                    <NoteEditorModal 
                        onClose={handleCloseModal} 
                        darkMode={darkMode} 
                        noteToEdit={noteToEdit} 
                        onSave={handleSaveNote}
                    />
                )}
                {isViewerOpen && noteToView && (
                    <NoteViewerModal 
                        note={noteToView}
                        onClose={handleCloseViewer}
                        onEdit={() => handleEditNote(noteToView)}
                        onDelete={() => handleDeleteNote(noteToView._id)}
                        darkMode={darkMode}
                    />
                )}
                {isProfileOpen && (
                    <ProfileModal
                        userProfile={userProfile}
                        notes={notes}
                        onClose={handleCloseProfile}
                        onUpdateProfile={fetchUserProfile}
                        darkMode={darkMode}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;