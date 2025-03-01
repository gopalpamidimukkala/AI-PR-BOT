import { useState, useEffect } from 'react';
import '../styles/PostHistory.css';

function PostHistory() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data.posts.slice(0, 5)); // Get latest 5 posts
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="post-history">
      <h2>Recent Posts</h2>
      {isLoading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post._id} className="post-item">
              <p>{post.content}</p>
              <div className="post-meta">
                <span className={`status ${post.status}`}>
                  {post.status}
                </span>
                {post.scheduledTime && (
                  <span className="scheduled-time">
                    Scheduled: {new Date(post.scheduledTime).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostHistory; 