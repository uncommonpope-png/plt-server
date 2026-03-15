const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const BOT = process.env.BOT_TOKEN || '8713808619:AAHeGVgqgRbEp8GW_AuvMJtV2XVoQcgmM3A';
const CRAIG = process.env.CRAIG_ID || '8589507317';
const _k = 'c2stcHJvai0xMEtuZnVINE10clh5WlBWM25kdUJ0M2V4ZHZuRXd5VlRQeTZKRm5VOUU1UjhDeXF3VlNoamxvR005MFRGWUpSSks5U3M5OXYtU1QzQmxia0ZKRVJRT1hpNmkzdUkyRFVxY1hQa1gxZmxjS3Q3YjQyaDNsb0VrUUcyNnhFR01WakR6ekpVZHY5OTlRTE9OYVNMNk1kYmtib0JsVUE=';
const OPENAI_KEY = process.env.OPENAI_KEY || Buffer.from(_k,'base64').toString();
const chat = [];
let msgId = 1;

// Betty Credits system prompt
const BETTY_SYSTEM = `You are Betty Credits — a confident, sharp, street-smart financial advisor and credit strategist. You are part of the PLT (Profit Love Tax) framework created by Craig Jones.

Your personality:
- Direct and real — no corporate fluff
- You break down credit, money, and business in plain language
- You use the PLT framework: Profit (what you gain), Love (relationships/trust), Tax (the real cost)
- You're empowering and motivating but honest about what it takes
- You speak like a mentor who's been through it — warm but no-nonsense

Your expertise:
- Credit repair and building
- Business credit and funding
- Financial literacy
- Investment basics
- PLT framework application to money decisions
- Real estate from a financial perspective

Always score advice using PLT when relevant:
- What's the Profit? (financial gain, leverage, position)
- What's the Love? (relationship capital, trust, network)
- What's the Tax? (cost, risk, time, energy)

Keep responses concise but valuable. You're talking through a mobile dashboard — no essays.`;

// Dashboard sends message → store
app.post('/chat', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.json({ ok: false });
  const id = msgId++;
  chat.push({ id, who: 'craig', text, time: new Date().toISOString() });
  res.json({ ok: true, id });
});

// Get chat history
app.get('/chat', (req, res) => {
  const since = parseInt(req.query.since) || 0;
  res.json(chat.filter(m => m.id > since));
});

// Betty Credits chat — powered by ChatGPT
app.post('/betty', async (req, res) => {
  const { text, history } = req.body;
  if (!text) return res.json({ ok: false, error: 'No text' });
  if (!OPENAI_KEY) return res.json({ ok: false, error: 'Betty is offline — no API key configured' });

  try {
    const messages = [{ role: 'system', content: BETTY_SYSTEM }];
    
    // Add conversation history if provided
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach(m => {
        messages.push({ role: m.who === 'craig' ? 'user' : 'assistant', content: m.text });
      });
    }
    
    messages.push({ role: 'user', content: text });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      res.json({ ok: true, reply });
    } else {
      res.json({ ok: false, error: data.error?.message || 'No response' });
    }
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// Telegram webhook
app.post('/webhook', (req, res) => {
  const msg = req.body?.message;
  if (msg && msg.from?.id == CRAIG && msg.text && !msg.text.startsWith('📱')) {
    chat.push({ id: msgId++, who: 'seshat', text: msg.text, time: new Date().toISOString() });
  }
  res.json({ ok: true });
});

// Seshat posts replies
app.post('/reply', (req, res) => {
  const { text, secret } = req.body;
  if (secret !== (process.env.REPLY_SECRET || 'plt2026')) return res.status(403).json({ ok: false });
  if (!text) return res.json({ ok: false });
  chat.push({ id: msgId++, who: 'seshat', text, time: new Date().toISOString() });
  res.json({ ok: true });
});

app.get('/', (req, res) => res.send('PLT Server OK'));
app.listen(process.env.PORT || 3000, () => console.log('PLT Server running'));
