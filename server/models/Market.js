const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  price: Number,
  date: { type: Date, default: Date.now }
});

const marketSchema = new mongoose.Schema({
  crop: { type: String, required: true },
  market: { type: String, required: true },
  state: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  unit: { type: String, default: 'quintal' },
  priceHistory: [priceHistorySchema],
  bestSellTime: { type: String, default: '' },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Market', marketSchema);
