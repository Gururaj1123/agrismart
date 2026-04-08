const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Market = require('../models/Market');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalPosts = await Post.countDocuments();
    const totalMarkets = await Market.countDocuments();
    const recentFarmers = await User.find({ role: 'farmer' }).sort({ createdAt: -1 }).limit(5).select('-password');
    res.json({ totalFarmers, totalPosts, totalMarkets, recentFarmers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/farmers', protect, adminOnly, async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password').sort({ createdAt: -1 });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/farmers/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Farmer removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
