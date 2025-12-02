const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Circle = require('../models/Circle');
const { protect } = require('../middleware/auth');

// Create Post
router.post('/', protect, async (req, res) => {
  try {
    const { content, imageUrl, videoUrl, circleId } = req.body;

    const circle = await Circle.findById(circleId);
    if (!circle || !circle.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const post = await Post.create({
      author: req.user._id,
      circle: circleId,
      content,
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || ''
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Circle Feed
router.get('/circle/:circleId', protect, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.circleId);
    if (!circle || !circle.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const posts = await Post.find({ circle: req.params.circleId })
      .sort('-createdAt')
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture');

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like Post
router.post('/:postId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Comment
router.post('/:postId/comment', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      author: req.user._id,
      content
    });

    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'username profilePicture');

    res.json({ success: true, comments: updatedPost.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Post
router.delete('/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
