import { useNavigate } from 'react-router-dom';
import '../styles/PreviousButton.css';

const PreviousButton = () => {
    const navigate = useNavigate();

    return (
        <button 
            className="previous-button"
            onClick={() => navigate('/')}
            aria-label="Go back to dashboard"
        >
            <i className="fas fa-arrow-left"></i>
            Previous
        </button>
    );
};

export default PreviousButton; 