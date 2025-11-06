import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, User, Mail, Calendar, Edit2, Save, Camera, Upload,
    FileText, Star, Clock, Loader
} from 'lucide-react';

const ProfileModal = ({ userProfile, notes, onClose, onUpdateProfile, darkMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userProfile?.name || '');
    const [profilePicture, setProfilePicture] = useState(userProfile?.profilePicture || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    if (!userProfile) return null;

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('❌ Please select an image file');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('❌ Image size should be less than 5MB');
                return;
            }

            setSelectedFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload image to Cloudinary
    const handleUploadImage = async () => {
        if (!selectedFile) {
            alert('❌ Please select an image first');
            return;
        }

        setUploading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            formData.append('profilePicture', selectedFile);

            const response = await fetch('http://localhost:5001/api/users/upload-profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setProfilePicture(data.profilePicture);
                setPreviewUrl(null);
                setSelectedFile(null);
                alert('✅ Profile picture uploaded successfully!');
                onUpdateProfile(); // Refresh user profile
            } else {
                alert(`❌ ${data.message || 'Upload failed'}`);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('❌ Network error during upload');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5001/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                alert('✅ Profile updated successfully!');
                setIsEditing(false);
                onUpdateProfile();
            } else {
                alert('❌ Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('❌ Network error');
        } finally {
            setLoading(false);
        }
    };

    const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
    const textBase = darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
    const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
    const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
    const cardBg = darkMode ? 'bg-gray-700/50' : 'bg-gray-50';

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const featuredNotes = notes.filter(n => n.isFeatured).length;

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
                className={`${bgColor} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Header */}
                <div className={`p-6 border-b ${borderColor} flex items-center justify-between`}>
                    <h2 className={`text-2xl font-bold ${textBase}`}>
                        Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-all hover:scale-110 ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        }`}
                    >
                        <X className={`w-6 h-6 ${textBase}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <img 
                                src={previewUrl || profilePicture || userProfile.profilePicture || "https://i.pravatar.cc/150?img=5"} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full border-4 border-emerald-500 shadow-xl object-cover"
                            />
                            {isEditing && (
                                <>
                                    <input
                                        type="file"
                                        id="profile-picture-input"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="profile-picture-input"
                                        className="absolute bottom-0 right-0 bg-emerald-500 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-emerald-600 transition-colors"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </label>
                                </>
                            )}
                        </div>

                        {/* Upload Button (appears when file is selected) */}
                        {selectedFile && isEditing && (
                            <motion.button
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleUploadImage}
                                disabled={uploading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all ${
                                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload Image
                                    </>
                                )}
                            </motion.button>
                        )}

                        {/* Name Input/Display */}
                        {isEditing ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`text-2xl font-bold text-center p-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                                placeholder="Your Name"
                            />
                        ) : (
                            <h3 className={`text-2xl font-bold ${textBase}`}>
                                {userProfile.name}
                            </h3>
                        )}
                    </div>

                    {/* Profile Information */}
                    <div className={`${cardBg} rounded-xl p-6 space-y-4`}>
                        <h4 className={`text-lg font-semibold ${textBase} mb-4`}>
                            Account Information
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className={`w-5 h-5 ${textSecondary}`} />
                                <div>
                                    <p className={`text-xs font-medium ${textSecondary}`}>Email</p>
                                    <p className={`text-sm ${textBase}`}>{userProfile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar className={`w-5 h-5 ${textSecondary}`} />
                                <div>
                                    <p className={`text-xs font-medium ${textSecondary}`}>Member Since</p>
                                    <p className={`text-sm ${textBase}`}>{formatDate(userProfile.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className={`${cardBg} rounded-xl p-6`}>
                        <h4 className={`text-lg font-semibold ${textBase} mb-4`}>
                            Your Statistics
                        </h4>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <FileText className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className={`text-2xl font-bold ${textBase}`}>{notes.length}</p>
                                <p className={`text-xs ${textSecondary}`}>Total Notes</p>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Star className="w-8 h-8 text-yellow-500" />
                                </div>
                                <p className={`text-2xl font-bold ${textBase}`}>{featuredNotes}</p>
                                <p className={`text-xs ${textSecondary}`}>Featured</p>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Clock className="w-8 h-8 text-blue-500" />
                                </div>
                                <p className={`text-2xl font-bold ${textBase}`}>
                                    {Math.ceil((Date.now() - new Date(userProfile.createdAt)) / (1000 * 60 * 60 * 24))}
                                </p>
                                <p className={`text-xs ${textSecondary}`}>Days Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${borderColor} flex justify-end gap-3`}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setName(userProfile.name);
                                    setProfilePicture(userProfile.profilePicture || '');
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                className={`px-6 py-2 rounded-xl border transition-all ${
                                    darkMode 
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-700/50 border-gray-700'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-300'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProfileModal;