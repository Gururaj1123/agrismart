const express = require('express');
const router = express.Router();
const Market = require('../models/Market');
const { protect, adminOnly } = require('../middleware/auth');

// Get all market prices
router.get('/', protect, async (req, res) => {
  try {
    const { crop, state, market } = req.query;
    const filter = {};
    if (crop) filter.crop = new RegExp(crop, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (market) filter.market = new RegExp(market, 'i');
    const data = await Market.find(filter).sort({ updatedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single crop market
router.get('/:id', protect, async (req, res) => {
  try {
    const data = await Market.findById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Create market entry
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const entry = await Market.create(req.body);
    req.app.get('io').emit('marketUpdate', entry);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update price
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const entry = await Market.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Not found' });
    entry.priceHistory.push({ price: entry.currentPrice, date: new Date() });
    Object.assign(entry, req.body, { updatedAt: new Date() });
    await entry.save();
    req.app.get('io').emit('marketUpdate', entry);
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Market.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
