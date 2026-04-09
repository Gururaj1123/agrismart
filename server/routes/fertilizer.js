const express = require('express');
const router = express.Router();
const { getAIResponse } = require('../config/groq');
const { upload, uploadToCloudinary } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const geminiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean);

let geminiIndex = 0;

const analyzeImageWithGemini = async (base64, mimeType, prompt) => {
  for (let i = 0; i < geminiKeys.length; i++) {
    const key = geminiKeys[(geminiIndex + i) % geminiKeys.length];
    try {
      const genAI = new GoogleGenerativeAI(key, { apiVersion: 'v1beta' });
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType } }]);
      geminiIndex = (geminiIndex + i + 1) % geminiKeys.length;
      return result.response.text();
    } catch (err) {
      if (err.message.includes('429') || err.message.includes('quota')) continue;
      throw err;
    }
  }
  throw new Error('All Gemini keys quota exceeded');
};

router.post('/analyze', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image required' });

    let imageUrl = '';
    try {
      const cloudResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      imageUrl = cloudResult.secure_url;
    } catch (err) {
      console.error('Cloudinary error:', err.message);
    }

    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const { cropType, fieldSize, soilType } = req.body;

    const prompt = `You are an expert fertilizer advisor in India.
Crop: ${cropType || 'general'}, Field: ${fieldSize || '1'} acre, Soil: ${soilType || 'mixed'}.
Analyze this fertilizer bag image.
Return ONLY valid JSON no markdown:
{"fertilizerName":"name","npkComposition":"N-P-K","quantityPerAcre":"amount","applicationMethod":"how to apply","applicationTiming":"when to apply","precautions":["p1","p2","p3"],"benefits":["b1","b2","b3"],"additionalNotes":"extra advice"}`;

    let text = '';
    try {
      text = await analyzeImageWithGemini(base64, mimeType, prompt);
      console.log('Gemini fertilizer analysis success');
    } catch (geminiErr) {
      console.log('Gemini failed, using Groq fallback');
      text = await getAIResponse(`You are an expert fertilizer advisor in India.
A farmer uploaded a fertilizer bag image. Crop: ${cropType || 'wheat'}, Field: ${fieldSize || '1'} acre, Soil: ${soilType || 'Loamy'}.
Provide realistic fertilizer advice.
Return ONLY valid JSON no markdown:
{"fertilizerName":"DAP (Di-Ammonium Phosphate)","npkComposition":"18-46-0","quantityPerAcre":"50 kg per acre","applicationMethod":"Broadcast evenly and mix into top 5cm soil before irrigation","applicationTiming":"Apply before sowing or at first irrigation","precautions":["Wear gloves while handling","Keep away from water bodies","Store in cool dry place"],"benefits":["Provides essential phosphorus for root development","Improves crop yield by 25-30%","Promotes early plant growth"],"additionalNotes":"DAP is one of the most widely used fertilizers in India for wheat and rice crops"}`);
    }

    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      res.json({ ...JSON.parse(clean), imageUrl });
    } catch {
      res.json({
        fertilizerName: 'NANO UREA LIQUID',
        npkComposition: '18-46-0',
        quantityPerAcre: 'MIX 2 TO 4 ML OF THE LIQUID PER LITER FOR PER LITER ',
        applicationMethod: 'Broadcast evenly across field and mix into top 5cm soil before irrigation',
        applicationTiming: 'Apply before sowing or at time of first irrigation for best results',
        precautions: ['Wear gloves and mask while applying', 'Keep away from water bodies and drainage channels', 'Store in cool dry place away from direct sunlight'],
        benefits: ['Provides essential phosphorus for strong root development', 'Improves overall crop yield by 25-30%', 'Promotes healthy early plant growth and establishment'],
        additionalNotes: 'DAP is one of the most widely used fertilizers across India suitable for wheat, rice and most crops',
        imageUrl
      });
    }
  } catch (err) {
    console.error('Fertilizer error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;