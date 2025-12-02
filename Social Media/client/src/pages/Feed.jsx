import { useState, useEffect } from 'react';
import { circles, posts } from '../services/api';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import './Feed.css';

function Feed() {
  const [myCircles, setMyCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCircles();
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      loadFeed();
    }
  }, [selectedCircle]);

  const loadCircles = async () => {
    try {
      const { data } = await circles.getMyCircles();
      setMyCircles(data.circles);
      if (data.circles.length > 0) {
        setSelectedCircle(data.circles[0]._id);
      }
    } catch (error) {
      console.error('Error loading circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeed = async () => {
    try {
      const { data } = await posts.getCircleFeed(selectedCircle);
      setFeedPosts(data.posts);
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (myCircles.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Circles Yet</h2>
        <p>Create or join a circle to start sharing!</p>
        <a href="/circles" className="btn-primary">Go to Circles</a>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="circle-selector">
        {myCircles.map(circle => (
          <button
            key={circle._id}
            className={selectedCircle === circle._id ? 'active' : ''}
            onClick={() => setSelectedCircle(circle._id)}
          >
            {circle.name}
          </button>
        ))}
      </div>

      <CreatePost circleId={selectedCircle} onPostCreated={loadFeed} />

      <div className="posts-list">
        {feedPosts.length === 0 ? (
          <p className="empty-feed">No posts yet. Be the first to share!</p>
        ) : (
          feedPosts.map(post => (
            <PostCard key={post._id} post={post} onUpdate={loadFeed} />
          ))
        )}
      </div>
    </div>
  );
}

export default Feed();
