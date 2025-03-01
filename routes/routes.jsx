import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../src/components/Home';
import TextPost from '../src/components/posts/TextPost';
import PhotoPost from '../src/components/posts/PhotoPost';
import SocialMediaAccounts from '../src/components/SocialMediaAccounts';
import AIModels from '../src/components/AIModels';
import Login from '../src/components/auth/Login';
import Signup from '../src/components/auth/Signup';
import ForgotPassword from '../src/components/auth/ForgotPassword';
import { useAuth } from '../src/contexts/AuthContext';

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />

            {/* Protected Routes */}
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
            <Route path="/text-post" element={user ? <TextPost /> : <Navigate to="/login" />} />
            <Route path="/photo-post" element={user ? <PhotoPost /> : <Navigate to="/login" />} />
            <Route path="/social-media-accounts" element={user ? <SocialMediaAccounts /> : <Navigate to="/login" />} />
            <Route path="/ai-models" element={user ? <AIModels /> : <Navigate to="/login" />} />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
    );
};

export default AppRoutes; 