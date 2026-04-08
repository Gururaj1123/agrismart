const { GoogleGenerativeAI } = require('@google/generative-ai');

const keys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean);

let currentIndex = 0;

const getModelWithRetry = async (prompt, modelName = 'gemini-2.0-flash', imageParts = null) => {
  let lastError;
  for (let i = 0; i < keys.length; i++) {
    const keyIndex = (currentIndex + i) % keys.length;
    const key = keys[keyIndex];
    try {
      console.log(`Trying Gemini key ${keyIndex + 1}...`);
      const genAI = new GoogleGenerativeAI(key, { apiVersion: 'v1beta' });
      const model = genAI.getGenerativeModel({ model: modelName });
      const parts = imageParts ? [prompt, ...imageParts] : [prompt];
      const result = await model.generateContent(parts);
      currentIndex = (keyIndex + 1) % keys.length;
      console.log(`Success with key ${keyIndex + 1}`);
      return result.response.text();
    } catch (err) {
      console.log(`Key ${keyIndex + 1} failed: ${err.message.slice(0, 80)}`);
      if (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  console.log('All keys exhausted, using fallback');
  throw lastError;
};

module.exports = { getModelWithRetry };