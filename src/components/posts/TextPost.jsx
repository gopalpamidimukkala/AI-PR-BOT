import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import PostModal from '../PostModal';
import '../../styles/TextPost.css';
import PreviousButton from '../PreviousButton';

const TextPost = ({ onSubmit }) => {
    const [content, setContent] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showInputSection, setShowInputSection] = useState(true);

    const handleGenerate = async () => {
        if (!content.trim()) {
            toast.error('Please enter some content');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5002/api/posts/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: content }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to generate content');
            }
            
            setGeneratedContent(data.content);
            setShowInputSection(false);
            toast.success('Content generated successfully!');
        } catch (error) {
            console.error('Error generating content:', error);
            toast.error(error.message || 'Failed to generate content');
            setShowInputSection(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = () => {
        setShowInputSection(true);
        setGeneratedContent('');
    };

    const handlePost = async (isScheduled = false, scheduledDate = null) => {
        if (!generatedContent) {
            toast.error('Please generate content first');
            return;
        }

        if (isScheduled && !scheduledDate) {
            toast.error('Please select a schedule time');
            return;
        }

        // Validate scheduled date
        if (isScheduled) {
            const scheduleTime = new Date(scheduledDate);
            if (scheduleTime <= new Date()) {
                toast.error('Schedule time must be in the future');
                return;
            }
        }

        setLoading(true);
        try {
            const postData = {
                content: generatedContent,
                scheduledTime: isScheduled ? scheduledDate : null
            };

            const response = await fetch('http://localhost:5002/api/posts/text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.details || 'Failed to create post');
            }

            toast.success(isScheduled ? 'Post scheduled successfully!' : 'Post created successfully!');
            setShowModal(false);
            
            // Reset form
            setContent('');
            setGeneratedContent('');
            setShowInputSection(true);
            
            // Call onSubmit callback if provided
            onSubmit?.(data.post);
        } catch (error) {
            console.error('Error posting content:', error);
            toast.error(error.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-post">
            {showInputSection ? (
                <div className="input-section">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe your post..."
                        className="input-textarea"
                        disabled={loading}
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !content.trim()}
                        className="action-button"
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Generating...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-magic"></i>
                                Generate Content
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="preview-section">
                    <h3>Generated Content</h3>
                    <div className="content-preview">
                        {generatedContent}
                    </div>
                    
                    <div className="action-buttons">
                        <button 
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="action-button"
                        >
                            <i className="fas fa-redo"></i>
                            Regenerate Content
                        </button>
                        <button 
                            onClick={() => setShowModal(true)}
                            disabled={loading}
                            className="action-button"
                        >
                            <i className="fas fa-paper-plane"></i>
                            Post Content
                        </button>
                    </div>
                </div>
            )}

            {showModal && (
                <PostModal
                    onClose={() => !loading && setShowModal(false)}
                    onPost={handlePost}
                    isLoading={loading}
                />
            )}
            <PreviousButton />
        </div>
    );
};

export default TextPost; 