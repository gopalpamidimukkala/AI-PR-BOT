import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ContentGenerator from './ContentGenerator';
import PostScheduler from './PostScheduler';
import PostHistory from './PostHistory';
import '../styles/Dashboard.css';

function Dashboard() {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Generate, 2: Schedule

  const handleContentGenerated = (content) => {
    setGeneratedContent(content);
    setStep(2);
  };

  const handleRegenerateContent = () => {
    setStep(1);
    setGeneratedContent('');
  };

  return (
    <div className="dashboard">
      <h1>PR Content Scheduler</h1>
      
      {step === 1 && (
        <ContentGenerator 
          onContentGenerated={handleContentGenerated}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      {step === 2 && (
        <PostScheduler 
          content={generatedContent}
          onRegenerateContent={handleRegenerateContent}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      <PostHistory />
    </div>
  );
}

export default Dashboard; 