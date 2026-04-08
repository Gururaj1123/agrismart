const fs = require('fs');

const files = [
  'routes/weather.js',
  'routes/soil.js', 
  'routes/disease.js',
  'routes/fertilizer.js'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/gemini-1\.5-flash/g, 'gemini-2.0-flash');
  c = c.replace(/gemini-pro-vision/g, 'gemini-2.0-flash');
  c = c.replace(/gemini-pro/g, 'gemini-2.0-flash');
  c = c.replace(
    'new GoogleGenerativeAI(process.env.GEMINI_API_KEY)',
    "new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' })"
  );
  fs.writeFileSync(f, c);
  console.log('Fixed:', f);
});