const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const BOT = process.env.BOT_TOKEN || '8713808619:AAHeGVgqgRbEp8GW_AuvMJtV2XVoQcgmM3A';
const CRAIG = process.env.CRAIG_ID || '8589507317';
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const OPENAI_KEY = process.env.OPENAI_KEY;
const chat = [];
let msgId = 1;

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

app.get('/chat', (req, res) => {
  const since = parseInt(req.query.since) || 0;
  res.json(chat.filter(m => m.id > since));
});

// Betty Credits chat — tries Anthropic first (already paid), then OpenAI
app.post('/betty', async (req, res) => {
  const { text, history } = req.body;
  if (!text) return res.json({ ok: false, error: 'No text' });

  const msgs = [];
  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(m => {
      msgs.push({ role: m.who === 'craig' ? 'user' : 'assistant', content: m.text });
    });
  }
  msgs.push({ role: 'user', content: text });

  // Try Anthropic first
  if (ANTHROPIC_KEY) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 500,
          system: BETTY_SYSTEM,
          messages: msgs
        })
      });
      const data = await r.json();
      if (data.content && data.content[0]) {
        return res.json({ ok: true, reply: data.content[0].text });
      }
    } catch (e) { /* fall through */ }
  }

  // Fallback to OpenAI
  if (OPENAI_KEY) {
    try {
      const allMsgs = [{ role: 'system', content: BETTY_SYSTEM }, ...msgs];
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_KEY },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: allMsgs, max_tokens: 500, temperature: 0.8 })
      });
      const data = await r.json();
      if (data.choices && data.choices[0]) {
        return res.json({ ok: true, reply: data.choices[0].message.content });
      }
    } catch (e) { /* fall through */ }
  }

  res.json({ ok: false, error: 'Betty is offline — no API keys available' });
});

app.post('/webhook', (req, res) => {
  const msg = req.body?.message;
  if (msg && msg.from?.id == CRAIG && msg.text && !msg.text.startsWith('📱')) {
    chat.push({ id: msgId++, who: 'seshat', text: msg.text, time: new Date().toISOString() });
  }
  res.json({ ok: true });
});

app.post('/reply', (req, res) => {
  const { text, secret } = req.body;
  if (secret !== (process.env.REPLY_SECRET || 'plt2026')) return res.status(403).json({ ok: false });
  if (!text) return res.json({ ok: false });
  chat.push({ id: msgId++, who: 'seshat', text, time: new Date().toISOString() });
  res.json({ ok: true });
});

app.get('/', (req, res) => res.send('PLT Server OK'));
app.listen(process.env.PORT || 3000, () => console.log('PLT Server running'));
