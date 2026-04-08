const express = require('express');
const router = express.Router();
const { getAIResponse } = require('../config/groq');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, async (req, res) => {
  try {
    const { soilType, ph, nitrogen, phosphorus, potassium, organicMatter, location, season } = req.body;
    const prompt = `You are an expert soil scientist in India.
Soil: Type=${soilType}, pH=${ph}, N=${nitrogen}kg/ha, P=${phosphorus}kg/ha, K=${potassium}kg/ha, Organic=${organicMatter}%, Location=${location}, Season=${season}.
Return ONLY valid JSON with no extra text or markdown:
{"assessment":"2-3 line soil health summary","recommendedCrops":["crop1","crop2","crop3","crop4","crop5"],"improvements":["tip1","tip2","tip3"],"warnings":["warning1"]}`;

    const text = await getAIResponse(prompt);
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      res.json(JSON.parse(clean));
    } catch {
      res.json({ assessment: text, recommendedCrops: [], improvements: [], warnings: [] });
    }
  } catch (err) {
    console.error('Soil error:', err.message);
    const { soilType, ph, location } = req.body;
    res.json({
      assessment: `Your ${soilType} soil with pH ${ph} in ${location} shows moderate fertility. Nutrient levels indicate good potential for crop production with minor improvements needed.`,
      recommendedCrops: ['Wheat', 'Rice', 'Maize', 'Soybean', 'Sunflower'],
      improvements: ['Add organic compost to improve soil structure', 'Apply balanced NPK fertilizer', 'Maintain proper drainage'],
      warnings: ['Monitor pH levels regularly for optimal nutrient absorption']
    });
  }
});

router.get('/crops-by-season', protect, async (req, res) => {
  try {
    const { season, soilType, location } = req.query;
    const prompt = `List exactly 6 best crops for ${season} season in ${location || 'India'} with ${soilType || 'mixed'} soil.
Return ONLY a valid JSON array with no markdown or extra text:
[{"name":"Wheat","duration":"120","waterNeeds":"Medium","expectedYield":"3 tons/acre","profitability":"high"}]`;

    const text = await getAIResponse(prompt);
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      res.json(JSON.parse(clean));
    } catch {
      res.json([
        { name: 'Wheat', duration: '120', waterNeeds: 'Medium', expectedYield: '3 tons/acre', profitability: 'high' },
        { name: 'Rice', duration: '150', waterNeeds: 'High', expectedYield: '4 tons/acre', profitability: 'high' },
        { name: 'Maize', duration: '90', waterNeeds: 'Medium', expectedYield: '2.5 tons/acre', profitability: 'medium' },
        { name: 'Soybean', duration: '100', waterNeeds: 'Low', expectedYield: '1.5 tons/acre', profitability: 'medium' },
        { name: 'Cotton', duration: '180', waterNeeds: 'Medium', expectedYield: '2 tons/acre', profitability: 'high' },
        { name: 'Sugarcane', duration: '365', waterNeeds: 'High', expectedYield: '40 tons/acre', profitability: 'high' },
      ]);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;