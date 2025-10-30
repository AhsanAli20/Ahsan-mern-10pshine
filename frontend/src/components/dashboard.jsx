// File: Dashboard.jsx (UPDATED)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 💡 Zaroori Imports
import { useNavigate } from 'react-router-dom'; // navigate use karne ke liye
import { useAuth } from '../context/AuthContext'; // logout function use karne ke liye

import NoteCard from './NoteCard'; 
import { 
    Menu, Search, Home, Folder, User, LogOut, 
    Moon, Sun, Plus, BookOpen, 
    ChevronLeft, ChevronRight 
} from 'lucide-react';

// ... (TextSlider Component unchanged) ...
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

    // 💡 LOGOUT FIX: Hooks ko yahan initialize karen
    const { logout } = useAuth(); 
    const navigate = useNavigate();

    // 💡 LOGOUT FUNCTION: Ab yeh Context se logout call karega
    const handleLogout = () => {
        // 1. Context se logout call karen (yeh function ab API bhi call karega)
        logout(); 
        
        // 2. User ko login page par redirect karen
        navigate('/login');
    };

    // Screen resize hone par sidebar state maintain karne ke liye (unchanged)
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


    // --- Data and Constants ---
    const notesData = [
        { title: "Project Pitch: AI Dashboard", content: "Developed a creative, modern UI for a note-taking app, focusing on user experience & sleek design.", date: "Jan 23, 2024", isFeatured: true },
        { title: "Internship Requirements", content: "User Auth, Rich Text, Pino Logger, React.js, React-js, NODES, MySQL...", date: "Jan 23, 2024", isFeatured: false },
        { title: "Meeting Notes - Q1 Planning", content: "Discussed project timelines, feature prioritization, and Key focus on frontend components.", date: "Jan 23, 24", isFeatured: true },
        { title: "Creative Ideas Collection", content: "Brainstorming session for new features and improvements to the note-taking experience.", date: "Jan 22, 2024", isFeatured: false },
    ];

    // Navigation Items - Exit ka button ab handleLogout call karega
    const navItems = [
        { icon: Home, label: 'Home', id: 'home', action: () => setActiveNav('home') },
        { icon: Folder, label: 'Notes', id: 'notes', action: () => setActiveNav('notes') },
        { icon: BookOpen, label: 'Blog', id: 'blog', action: () => setActiveNav('blog') }, 
        { icon: User, label: 'Profile', id: 'profile', action: () => setActiveNav('profile') },
        { icon: LogOut, label: 'Exit', id: 'exit', action: handleLogout }, // 💡 LOGOUT ACTION ADDED
    ];
    
    // Bottom Nav mein sirf pehle 4 items rakhe hain (LogOut chhod diya)
    const bottomNavItems = navItems.slice(0, 4);

    // Sidebar variants for animation (unchanged)
    const sidebarVariants = {
        open: { width: 280, x: 0, transition: { duration: 0.3 } }, 
        closed: { width: 80, x: 0, transition: { duration: 0.3 } } 
    };
    // ----------------------------------------

    // Dynamic Color Classes (unchanged)
    const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
    const sidebarBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const headerBg = darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/90 border-gray-200';
    const bottomNavBg = darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'; 
    const textBase = darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';

 

    return (
        <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
            <div className="flex min-h-screen overflow-hidden"> 
                
                {/* -------------------- ANIMATED SIDEBAR (Desktop Only) -------------------- */}
                <motion.div
                    className={`${sidebarBg} flex-col relative transition-all duration-300 z-50 md:flex hidden md:static fixed top-0 bottom-0 overflow-y-auto`}
                    initial="closed" 
                    animate={sidebarOpen ? "open" : "closed"}
                    variants={sidebarVariants}
                >
                    
                    {/* Sidebar Toggle Button (Desktop Only) */}
                    <motion.button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`absolute right-[-10px] sm:-right-3 top-4 sm:top-8 rounded-full p-1 sm:p-2 transition-colors z-10 hidden md:block ${
                            darkMode ? 'bg-gray-700 hover:bg-emerald-600' : 'bg-gray-200 hover:bg-emerald-500 border border-gray-300'
                        }`}
                        animate={{ x: sidebarOpen ? 0 : 0 }} 
                    >
                        {sidebarOpen 
                            ? <ChevronLeft className={`w-3 h-3 sm:w-4 sm:h-4 ${darkMode ? 'text-white' : 'text-gray-900'}`} /> 
                            : <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 ${darkMode ? 'text-white' : 'text-gray-900'}`} />}
                    </motion.button>

                    {/* Logo (Desktop Only) */}
                    <div className={`p-4 sm:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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

                    {/* Navigation Items (Desktop Only) */}
                    <nav className="flex-1 p-2 sm:p-4 space-y-1 sm:space-y-2">
                        {navItems.map((item, index) => (
                            <motion.button
                                key={item.id}
                                // 💡 ACTION FIX: activeNav set karne ke bajaaye, ab action prop ko call karen
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

                    {/* User Profile (Desktop Only) */}
                    <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center space-x-3">
                            <img 
                                src="https://i.pravatar.cc/150?img=5" 
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
                                        <p className={`font-medium text-xs sm:text-sm truncate ${textBase}`}>Anika Sharma</p>
                                        <p className={`text-xs hidden sm:block ${textSecondary}`}>Premium User</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
                
                {/* -------------------- MAIN CONTENT AREA -------------------- */}
                <div className="flex-1 overflow-auto pb-20 md:pb-0"> 
                    
                    {/* Top Header */}
                    <header className={`${headerBg} backdrop-blur-lg sticky top-0 z-40`}>
                        <div className="px-4 py-3 sm:px-8 sm:py-4">
                            <div className="flex items-center justify-between">
                                
                                {/* Left: Breadcrumb */}
                                <motion.div 
                                    className={`hidden sm:flex items-center space-x-2 ${textSecondary}`}
                                >
                                    <Home className="w-4 h-4" />
                                    <span>/</span>
                                    <span className={`capitalize ${textBase}`}>{activeNav}</span>
                                </motion.div>

                                {/* Center: Modified Animated Text Slider */}
                                <TextSlider />

                                {/* Right: Controls - Notification replaced with Login */}
                                <div className="flex items-center space-x-2 sm:space-x-4">
                                    
                                    {/* Dark Mode Toggle */}
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
                                Welcome back, Anika! 👋
                            </h1>
                            <p className={`text-sm sm:text-lg ${textSecondary}`}>
                                You have {notesData.length} notes. {notesData.filter(n => n.isFeatured).length} are featured.
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
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-xl flex items-center space-x-2 shadow-lg transition-all duration-200 text-sm"
                            >
                                <Plus className="w-5 h-5" />
                                <span>New Note</span>
                            </motion.button>
                        </motion.div>

                        {/* Notes Grid - Using NoteCard component */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                        >
                            <AnimatePresence>
                                {notesData.map((note, index) => (
                                    <NoteCard key={index} {...note} darkMode={darkMode} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </main>
                </div>

                {/* -------------------- MOBILE BOTTOM NAVIGATION BAR -------------------- */}
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
                                onClick={item.action} // 💡 ACTION FIX: activeNav set karne ke bajaaye, ab action prop ko call karen
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
                        {/* 💡 LOGOUT BUTTON FOR MOBILE (separate for clear action) */}
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
        </div>
    );
};

export default Dashboard;