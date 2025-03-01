import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import '../../styles/auth/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await resetPassword(email);
            toast.success('Password reset email sent! Check your inbox.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
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
                    <h1>Reset your password</h1>
                    <p>Enter your email address and we'll send you a password reset link</p>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className={`auth-button auth-button-primary ${loading ? 'loading' : ''}`}
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-rounded loading-spinner">progress_activity</span>
                                Sending reset link...
                            </>
                        ) : (
                            'Send reset link'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Remember your password?{' '}
                    <Link to="/login">Back to login</Link>
                </div>
            </div>
        </motion.div>
    );
};

export default ForgotPassword; 