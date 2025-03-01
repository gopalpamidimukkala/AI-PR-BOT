import { useNavigate } from 'react-router-dom';
import '../styles/PostTypeSelector.css';

const PostTypeSelector = () => {
    const navigate = useNavigate();

    return (
        <div className="post-type-selector">
            <h2>Choose Post Type</h2>
            <div className="post-type-buttons">
                <button onClick={() => navigate('/text-post')}>
                    <i className="fas fa-file-text"></i>
                    Text Post
                </button>
                <button onClick={() => navigate('/photo-post')}>
                    <i className="fas fa-image"></i>
                    Photo Post
                </button>
            </div>
        </div>
    );
};

export default PostTypeSelector; 