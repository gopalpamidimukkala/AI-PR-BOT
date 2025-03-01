import { useState } from 'react';
import toast from 'react-hot-toast';
import '../styles/ContentGenerator.css';

function ContentGenerator({ onContentGenerated, isLoading, setIsLoading }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to generate content');
      
      const data = await response.json();
      onContentGenerated(data.content);
    } catch (error) {
      toast.error('Failed to generate content. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-generator">
      <h2>Generate PR Content</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your PR content prompt..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Content'}
        </button>
      </form>
    </div>
  );
}

export default ContentGenerator; 