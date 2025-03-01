import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import '../../styles/auth/Auth.css';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signup(email, password);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            await signInWithGoogle();
            toast.success('Account created successfully with Google!');
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="auth-container"
        >
            <div className="auth-logo">
                <h1 className="text-2xl font-bold">AI-PR-Bot</h1>
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create an account</h1>
                    <p>Join AI-PR-Bot and start automating your social media</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                        />
                        <div className="password-requirements">
                            <div className={`requirement-item ${password.length >= 12 ? 'met' : ''}`}>
                                <span className="material-symbols-rounded">
                                    {password.length >= 12 ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                At least 12 characters
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`auth-button auth-button-primary ${loading ? 'loading' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-rounded loading-spinner">progress_activity</span>
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </button>
                        <div className="auth-footer">
                            Already have an account?{' '}
                            <Link to="/login">Sign in</Link>
                        </div>
                    </div>

                    <div className="auth-divider">OR</div>

                    <div className="oauth-buttons">
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            className="oauth-button"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" />
                            Continue with Google
                        </button>
                        <button type="button" className="oauth-button">
                            <span className="material-symbols-rounded">phone_iphone</span>
                            Continue with Phone
                        </button>
                        <button type="button" className="oauth-button">
                            Continue with Microsoft Account
                        </button>
                        <button type="button" className="oauth-button">
                            Continue with Apple
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Signup; 