import React, { useState } from 'react';
import '../styles/PostModal.css';

const PostModal = ({ onClose, onPost, isLoading }) => {
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');

    const handlePostNow = () => {
        onPost(false);
    };

    const handleSchedulePost = () => {
        if (!scheduledDate) {
            setShowSchedule(true);
            return;
        }
        onPost(true, scheduledDate);
    };

    return (
        <div className="post-modal-overlay">
            <div className="post-modal">
                <button className="close-button" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <h3>Choose Posting Option</h3>
                
                <div className="post-options">
                    <button 
                        className="post-button"
                        onClick={handlePostNow}
                        disabled={isLoading}
                    >
                        <i className="fas fa-paper-plane"></i>
                        Post Now
                    </button>

                    <div className="schedule-section">
                        {showSchedule && (
                            <input
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="schedule-input"
                            />
                        )}
                        <button 
                            className="post-button schedule-button"
                            onClick={handleSchedulePost}
                            disabled={isLoading || (showSchedule && !scheduledDate)}
                        >
                            <i className="fas fa-clock"></i>
                            {showSchedule ? 'Confirm Schedule' : 'Schedule Post'}
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div className="loading-indicator">
                        <i className="fas fa-spinner fa-spin"></i>
                        Processing...
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostModal;
