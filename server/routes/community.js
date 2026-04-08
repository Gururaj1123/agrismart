const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { upload, uploadToCloudinary } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

router.get('/posts', protect, async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = category && category !== 'all' ? { category } : {};
    const posts = await Post.find(filter)
      .populate('user', 'name phone avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Post.countDocuments(filter);
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/posts', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    let imageUrl = '';
    if (req.file) {
      const cloudResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      imageUrl = cloudResult.secure_url;
    }
    const post = await Post.create({
      user: req.user._id,
      title,
      content,
      category: category || 'general',
      image: imageUrl
    });
    const populated = await post.populate('user', 'name phone avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/posts/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/posts/:id/comment', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.user._id, text: req.body.text });
    await post.save();
    const updated = await Post.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar');
    res.json(updated.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/posts/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;