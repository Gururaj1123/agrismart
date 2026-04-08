const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Farmer Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, phone, password, language, location } = req.body;
    if (await User.findOne({ phone }))
      return res.status(400).json({ message: 'Phone already registered' });
    const user = await User.create({ name, phone, password, language: language || 'en', location: location || '' });
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name: user.name, phone: user.phone, role: user.role, language: user.language } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Farmer Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: 'Invalid phone or password' });
    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, phone: user.phone, role: user.role, language: user.language } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD)
      return res.status(400).json({ message: 'Invalid admin credentials' });
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) admin = await User.create({ name: 'Admin', phone: '0000000000', password: process.env.ADMIN_PASSWORD, role: 'admin' });
    res.json({ token: generateToken(admin._id), user: { id: admin._id, name: 'Admin', role: 'admin' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update language
router.put('/language', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { language: req.body.language }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
