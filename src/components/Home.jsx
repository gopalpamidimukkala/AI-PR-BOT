import React, { useState, useEffect } from 'react';
import PostTypeSelector from './PostTypeSelector';
import '../styles/Home.css';

const Home = () => {
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecentPosts();
        // Set up polling to refresh posts every minute
        const interval = setInterval(fetchRecentPosts, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchRecentPosts = async () => {
        try {
            setError(null);
            const response = await fetch('http://localhost:5002/api/posts/recent', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            
            const data = await response.json();
            setRecentPosts(data.posts);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load recent posts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            posted: { icon: 'check-circle', label: 'Posted' },
            scheduled: { icon: 'clock', label: 'Scheduled' },
            failed: { icon: 'exclamation-circle', label: 'Failed' },
            pending: { icon: 'hourglass-half', label: 'Pending' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`status-badge ${status}`}>
                <i className={`fas fa-${config.icon}`}></i>
                {config.label}
            </span>
        );
    };

    return (
        <div className="home">
            <h1>Welcome to AI-PR-Bot</h1>
            
            <PostTypeSelector />

            <div className="recent-posts">
                <h2>
                    <i className="fas fa-history"></i>
                    Recent Posts
                </h2>

                {loading ? (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading recent posts...
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                ) : (
                    <div className="posts-grid">
                        {recentPosts.map((post) => (
                            <div key={post._id} className="post-card">
                                <div className="post-type">
                                    <i className={`fas fa-${post.postType === 'photo' ? 'image' : 'file-text'}`}></i>
                                    {post.postType === 'photo' ? 'Photo Post' : 'Text Post'}
                                </div>
                                
                                <div className="post-content">
                                    {post.content.substring(0, 100)}
                                    {post.content.length > 100 && '...'}
                                </div>

                                <div className="post-meta">
                                    <div className="post-dates">
                                        {post.scheduledTime && (
                                            <div className="scheduled-time">
                                                <i className="fas fa-calendar"></i>
                                                Scheduled: {formatDate(post.scheduledTime)}
                                            </div>
                                        )}
                                        <div className="posted-time">
                                            <i className="fas fa-clock"></i>
                                            Created: {formatDate(post.createdAt)}
                                        </div>
                                    </div>
                                    <div className="post-status">
                                        {getStatusBadge(post.status)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home; 