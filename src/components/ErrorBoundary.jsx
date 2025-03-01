import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-container">
                    <h2>Something went wrong</h2>
                    <p>{this.state.error?.message || 'An error occurred'}</p>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="retry-button"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 