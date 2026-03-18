const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// Basic status endpoint
app.get('/', (req, res) => {
  res.json({ status: 'PLT Server Running', timestamp: new Date().toISOString() });
});

app.get('/status', (req, res) => {
  res.json({ status: 'online', server: 'plt-server', version: '1.0', timestamp: new Date().toISOString() });
});

// Chat endpoint for dashboard
app.post('/chat', (req, res) => {
  const { text } = req.body;
  res.json({ 
    response: `Received: ${text}`, 
    timestamp: new Date().toISOString(),
    server: 'plt-server'
  });
});

// Betty Credits Knowledge Engine
const BETTY_KB = {
  greetings: ["Hey! I'm Betty Credits. Ask me about credit, money, or PLT.", "Betty Credits here. What's on your mind?"],
  plt: "PLT = Profit · Love · Tax. Created by Craig Jones. Score any interaction: PROFIT + LOVE - TAX = SOUL PROFIT",
  credit: "Credit = your financial reputation. Pay on time, keep utilization low, don't close old accounts.",
  books: "18 PLT books available for $49: uncommonpope-png.github.io/plt-press/bundle.html",
  services: "AI Agent Setup ($100), Social Media Package ($75), Email Automation ($75), Business Docs ($150)"
};

function bettyRespond(text) {
  const t = text.toLowerCase();
  if (t.includes('hi') || t.includes('hello') || t.includes('hey')) return BETTY_KB.greetings[0];
  if (t.includes('plt') || t.includes('framework')) return BETTY_KB.plt;
  if (t.includes('credit') || t.includes('score')) return BETTY_KB.credit;
  if (t.includes('book') || t.includes('bundle')) return BETTY_KB.books;
  if (t.includes('service') || t.includes('hire')) return BETTY_KB.services;
  return "Ask me about PLT framework, credit, books, or services. What do you need?";
}

app.post('/betty', (req, res) => {
  const { text } = req.body;
  const response = bettyRespond(text || '');
  res.json({ response, character: 'Betty Credits', timestamp: new Date().toISOString() });
});

// Health check
app.get('/wake', (req, res) => {
  res.json({ awake: true, timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`PLT Server running on port ${port}`);
});