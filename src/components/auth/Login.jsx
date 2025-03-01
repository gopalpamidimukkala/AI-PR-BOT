import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import '../../styles/auth/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Successfully logged in!');
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            toast.success('Successfully logged in with Google!');
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
                    <h1>Welcome back</h1>
                    <p>Sign in to continue to AI-PR-Bot</p>
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
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <Link to="/forgot-password" className="text-sm text-right text-gray-600 hover:underline">
                        Forgot password?
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`auth-button auth-button-primary ${loading ? 'loading' : ''}`}
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-rounded loading-spinner">progress_activity</span>
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </button>

                    <div className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/signup">Sign up</Link>
                    </div>

                    <div className="auth-divider">OR</div>

                    <div className="oauth-buttons">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
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

export default Login; 