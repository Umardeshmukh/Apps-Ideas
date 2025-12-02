const express = require('express');
const router = express.Router();
const Circle = require('../models/Circle');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

// Create Circle
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const inviteCode = crypto.randomBytes(6).toString('hex');

    const circle = await Circle.create({
      name,
      description,
      creator: req.user._id,
      members: [req.user._id],
      inviteCode
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { circles: circle._id }
    });

    res.status(201).json({ success: true, circle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User's Circles
router.get('/my-circles', protect, async (req, res) => {
  try {
    const circles = await Circle.find({ members: req.user._id })
      .populate('creator', 'username profilePicture')
      .populate('members', 'username profilePicture');
    
    res.json({ success: true, circles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join Circle with Invite Code
router.post('/join/:inviteCode', protect, async (req, res) => {
  try {
    const circle = await Circle.findOne({ inviteCode: req.params.inviteCode });
    
    if (!circle) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    if (circle.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    circle.members.push(req.user._id);
    await circle.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { circles: circle._id }
    });

    res.json({ success: true, circle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave Circle
router.delete('/:circleId/leave', protect, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.circleId);
    
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    circle.members = circle.members.filter(m => m.toString() !== req.user._id.toString());
    await circle.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { circles: circle._id }
    });

    res.json({ success: true, message: 'Left circle successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
