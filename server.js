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

// ── STRIPE CHECKOUT ──
const stripe = process.env.STRIPE_SK ? require('stripe')(process.env.STRIPE_SK) : null;

const PRODUCTS = {
  'plt-bundle':        { name: 'PLT Framework Complete Bundle', desc: '18 books on the PLT framework', amount: 4900 },
  'soul-profit':       { name: 'Soul Profit Guide', desc: "Entrepreneur's guide to lasting wealth", amount: 2700 },
  'plt-calculator-pro':{ name: 'PLT Calculator Pro', desc: 'Advanced PLT decision scoring tool', amount: 1900 }
};

app.post('/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payments not configured' });
  try {
    const { product, success_url, cancel_url } = req.body;
    const p = PRODUCTS[product];
    if (!p) return res.status(400).json({ error: 'Unknown product' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'usd', product_data: { name: p.name, description: p.desc }, unit_amount: p.amount }, quantity: 1 }],
      mode: 'payment',
      success_url: success_url || 'https://uncommonpope-png.github.io/plt-press/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancel_url || 'https://uncommonpope-png.github.io/plt-press/bundle.html',
      metadata: { product, source: 'plt-press' }
    });

    res.json({ url: session.url, id: session.id });
  } catch (e) {
    console.error('Checkout error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`PLT Server running on port ${port}`);
  console.log(`Stripe: ${stripe ? 'ACTIVE' : 'NOT CONFIGURED - set STRIPE_SK env var'}`);
});