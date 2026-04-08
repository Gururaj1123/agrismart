const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getAIResponse } = require('../config/groq');
const { protect } = require('../middleware/auth');

router.get('/current', protect, async (req, res) => {
  try {
    const { city = 'Mumbai', lat, lon } = req.query;
    const query = lat && lon ? `lat=${lat}&lon=${lon}` : `q=${city}`;
    const url = `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/forecast', protect, async (req, res) => {
  try {
    const { city = 'Mumbai', lat, lon } = req.query;
    const query = lat && lon ? `lat=${lat}&lon=${lon}` : `q=${city}`;
    const url = `https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/ai-advice', protect, async (req, res) => {
  try {
    const { weatherData, cropType, location } = req.body;
    const prompt = `You are an expert agricultural advisor in India.
Weather in ${location}: Temperature ${weatherData?.temp}°C, Humidity ${weatherData?.humidity}%, Condition: ${weatherData?.condition}, Wind: ${weatherData?.windSpeed} km/h.
Farmer grows: ${cropType || 'mixed crops'}.
Give exactly 4 numbered practical farming tips for today. Keep each tip to 1-2 sentences. Be specific and actionable.`;

    const text = await getAIResponse(prompt);
    res.json({ advice: text });
  } catch (err) {
    console.error('AI advice error:', err.message);
    const { weatherData, cropType, location } = req.body;
    const fallback = `1. Given the ${weatherData?.condition || 'current'} weather at ${weatherData?.temp || 25}°C in ${location}, monitor your ${cropType || 'crops'} closely for stress signs today.\n2. With humidity at ${weatherData?.humidity || 60}%, watch for early fungal disease symptoms — inspect leaves morning and evening.\n3. Wind conditions are suitable for light field work — good time for weeding and soil aeration.\n4. Ensure adequate irrigation based on today's temperature — hot days need 20% more water than usual.`;
    res.json({ advice: fallback });
  }
});

module.exports = router;