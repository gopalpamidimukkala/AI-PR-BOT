import { useState } from 'react';
import toast from 'react-hot-toast';
import '../styles/PostScheduler.css';

function PostScheduler({ content, onRegenerateContent, isLoading, setIsLoading }) {
  const [schedulePost, setSchedulePost] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  const handlePost = async () => {
    if (schedulePost && !scheduledTime) {
      toast.error('Please select a schedule time');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          scheduledTime: schedulePost ? scheduledTime : null
        })
      });

      if (!response.ok) throw new Error('Failed to create post');
      
      toast.success(schedulePost ? 'Post scheduled successfully!' : 'Post created successfully!');
      onRegenerateContent();
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="post-scheduler">
      <h2>Review & Schedule</h2>
      <div className="content-preview">
        <h3>Generated Content:</h3>
        <p>{content}</p>
      </div>

      <div className="scheduling-options">
        <label>
          <input
            type="checkbox"
            checked={schedulePost}
            onChange={(e) => setSchedulePost(e.target.checked)}
            disabled={isLoading}
          />
          Schedule for later
        </label>

        {schedulePost && (
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            disabled={isLoading}
          />
        )}

        <div className="actions">
          <button onClick={onRegenerateContent} disabled={isLoading}>
            Regenerate Content
          </button>
          <button onClick={handlePost} disabled={isLoading}>
            {isLoading ? 'Processing...' : schedulePost ? 'Schedule Post' : 'Post Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostScheduler; 