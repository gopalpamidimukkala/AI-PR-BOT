import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import PostModal from '../PostModal';
import '../../styles/PhotoPost.css';
import PreviousButton from '../PreviousButton';

const PhotoPost = ({ onSubmit }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [description, setDescription] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showInputSection, setShowInputSection] = useState(true);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                toast.error('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile) {
            toast.error('Please select an image first');
            return;
        }
        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5002/api/posts/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: description }),
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
            setError(error.message);
            toast.error(error.message || 'Failed to generate content');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = () => {
        setShowInputSection(true);
        setGeneratedContent('');
        setShowModal(false);
    };

    const handlePost = async (isScheduled = false, scheduledDate = null) => {
        if (!selectedFile || !generatedContent) {
            toast.error('Please select an image and generate content first');
            return;
        }

        if (isScheduled && !scheduledDate) {
            toast.error('Please select a schedule time');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('content', generatedContent);
        if (isScheduled) {
            formData.append('scheduledTime', scheduledDate);
        }

        try {
            const response = await fetch('http://localhost:5002/api/posts/photo', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.details || 'Failed to create post');
            }
            
            toast.success(isScheduled ? 'Post scheduled successfully!' : 'Post created successfully!');
            setShowModal(false);
            
            // Reset form
            setSelectedFile(null);
            setPreview(null);
            setDescription('');
            setGeneratedContent('');
            setShowInputSection(true);
            
            onSubmit?.(data.post);
        } catch (error) {
            console.error('Error posting content:', error);
            setError(error.message);
            toast.error(error.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="photo-post">
            {error && <div className="error-message" role="alert">{error}</div>}
            
            <div className="upload-section">
                <div className="file-input-container">
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleFileSelect}
                        className="file-input"
                        id="photo-upload"
                        disabled={loading}
                    />
                    <label htmlFor="photo-upload" className="file-input-label">
                        <i className="fas fa-cloud-upload-alt"></i>
                        {selectedFile ? 'Change Image' : 'Choose Image'}
                    </label>
                </div>

                {preview && (
                    <div className="preview-container">
                        <img src={preview} alt="Preview" className="image-preview" />
                    </div>
                )}
            </div>

            {showInputSection ? (
                <div className="content-section">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your photo..."
                        disabled={loading}
                        className="content-input"
                    />
                    
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !selectedFile || !description.trim()}
                        className="action-button generate-button"
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

export default PhotoPost; 