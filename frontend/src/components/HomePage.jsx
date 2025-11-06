import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Redirection ke liye import kiya
// NoteCard yahan use nahi hoga, lekin agar import hai to rehne dete hain
import NoteCard from './NoteCard'; 
import { 
    Menu, Search, Home, Folder, User, LogOut, 
    Moon, Sun, Plus, BookOpen, LogIn, // LogIn icon add kiya
    ChevronLeft, ChevronRight 
} from 'lucide-react';

// Animated Text Slider Component (Remains Unchanged)
const TextSlider = () => {
    const texts = [
        "Welcome,",
        "📝 Start Capturing Your Thoughts",
        "Login or Register!"
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

// Component ka naam HomePage kar diya
const HomePage = () => {
    const navigate = useNavigate(); // useNavigate hook initialize kiya
    const [darkMode, setDarkMode] = useState(true);
    
    // Side Navbar state maintain karne ke liye
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768); 
    const [activeNav, setActiveNav] = useState('home');
    
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
    
    // Notes data ko khali/delete kar diya hai kyunki yeh user specific hai
    const notesData = []; 

    // Navigation Items (Modified for Public View)
    const navItems = [
        { icon: Home, label: 'Home', id: 'home' },
        // Notes aur Blog ab protected hain
        { icon: Folder, label: 'Notes', id: 'notes', isProtected: true }, 
        { icon: BookOpen, label: 'Blog', id: 'blog', isProtected: true }, 
         { icon: LogIn, label: 'Login', id: 'login' }, 
    ];
    
    // Bottom Nav mein sirf Home, Notes, Blog, aur Login rahenge
    const bottomNavItems = navItems.filter(item => item.id !== 'exit' && item.id !== 'profile');

    // Sidebar variants for animation (unchanged)
    const sidebarVariants = {
        open: { width: 280, x: 0, transition: { duration: 0.3 } }, 
        closed: { width: 80, x: 0, transition: { duration: 0.3 } } 
    };

    // Dynamic Color Classes (unchanged)
    const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
    const sidebarBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const headerBg = darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/90 border-gray-200';
    const bottomNavBg = darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200';
    const textBase = darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';

    // ----------------------------------------
    // --- Redirection Logic ---
    // ----------------------------------------
    const handleNavClick = (item) => {
        if (item.isProtected || item.id === 'notes' || item.id === 'blog' || item.id === 'login') {
            // Protected items ya Login button -> Login Page par redirect
            navigate('/login');
        } else {
            // Home page par hi rahenge
            setActiveNav(item.id);
        }
    };
  
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
                    
                    {/* Sidebar Toggle Button (Unchanged) */}
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

                    {/* Logo (Unchanged) */}
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

                    {/* Navigation Items (Desktop Only) - Redirection Logic Added */}
                    <nav className="flex-1 p-2 sm:p-4 space-y-1 sm:space-y-2">
                        {navItems.map((item, index) => (
                            <motion.button
                                key={item.id}
                                // Handle Nav Click use kiya
                                onClick={() => handleNavClick(item)} 
                                className={`w-full flex items-center space-x-3 p-2 sm:p-3 rounded-xl transition-all duration-200 text-sm ${
                                    // Home ko active rakha, baaki sab non-active/protected style mein
                                    activeNav === item.id && !item.isProtected
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

                    
                </motion.div>
                
                {/* -------------------- MAIN CONTENT AREA -------------------- */}
                <div className="flex-1 overflow-auto pb-20 md:pb-0"> 
                    
                    {/* Top Header (Unchanged) */}
                    <header className={`${headerBg} backdrop-blur-lg sticky top-0 z-40`}>
                        <div className="px-4 py-3 sm:px-8 sm:py-4">
                            <div className="flex items-center justify-between">
                                
                                {/* Left: Breadcrumb (Modified for Home Page) */}
                                <motion.div 
                                    className={`hidden sm:flex items-center space-x-2 ${textSecondary}`}
                                >
                                    <Home className="w-4 h-4" />
                                    <span>/</span>
                                    <span className={`capitalize ${textBase}`}>Public Home</span>
                                </motion.div>

                                {/* Center: Animated Text Slider (Unchanged) */}
                                <TextSlider />

                                {/* Right: Controls - Dark Mode Toggle (Unchanged) */}
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
                        
                        {/* Welcome Section - Modified to be generic */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 sm:mb-8"
                        >
                            <h1 className={`text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 ${textBase}`}>
                                Your Ideas. Organized. 
                            </h1>
                            <p className={`text-sm sm:text-lg ${textSecondary}`}>
                                Login or register now to start writing your notes!
                            </p>
                        </motion.div>

                        {/* Search and Actions - Hata diye, kyunki yeh protected hain */}
                        
                        {/* Static Content with CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`p-6 sm:p-10 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <h2 className={`text-2xl sm:text-3xl font-extrabold text-emerald-500 mb-4`}>
                                Why Join NoteApp?
                            </h2>
                            <ul className={`list-disc list-inside text-lg mb-6 ${textSecondary} space-y-2`}>
                                <li> Secure cloud storage for all your notes.</li>
                                <li> Sleek dark mode/light mode experience.</li>
                                <li> Easy-to-use interface.</li>
                            </ul>
                            
                            <motion.button 
                                onClick={() => navigate('/register')}
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <User className="w-5 h-5" />
                                <span>Create Your Free Account</span>
                            </motion.button>
                        </motion.div>

                        {/* Notes Grid - Hata diya hai */}
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
                                // Handle Nav Click use kiya
                                onClick={() => handleNavClick(item)}
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
                    </div>
                </motion.nav>
            </div>
        </div>
    );
};

export default HomePage;