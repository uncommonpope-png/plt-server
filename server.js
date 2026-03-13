const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const BOT = process.env.BOT_TOKEN || '8713808619:AAHeGVgqgRbEp8GW_AuvMJtV2XVoQcgmM3A';
const CRAIG = process.env.CRAIG_ID || '8589507317';
const chat = [];
let msgId = 1;

// Dashboard sends message → forward to Telegram
app.post('/chat', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.json({ ok: false });
  const id = msgId++;
  chat.push({ id, who: 'craig', text, time: new Date().toISOString() });
  // Forward to Seshat via Telegram
  await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CRAIG, text: '📱 Dashboard: ' + text })
  });
  res.json({ ok: true, id });
});

// Get chat history
app.get('/chat', (req, res) => {
  const since = parseInt(req.query.since) || 0;
  res.json(chat.filter(m => m.id > since));
});

// Telegram webhook → Seshat's replies appear in dashboard
app.post('/webhook', (req, res) => {
  const msg = req.body?.message;
  if (msg && msg.from?.id == CRAIG && msg.text && !msg.text.startsWith('📱')) {
    chat.push({ id: msgId++, who: 'seshat', text: msg.text, time: new Date().toISOString() });
  }
  res.json({ ok: true });
});

// Seshat posts replies here after responding
app.post('/reply', (req, res) => {
  const { text, secret } = req.body;
  if (secret !== (process.env.REPLY_SECRET || 'plt2026')) return res.status(403).json({ ok: false });
  if (!text) return res.json({ ok: false });
  chat.push({ id: msgId++, who: 'seshat', text, time: new Date().toISOString() });
  res.json({ ok: true });
});

app.get('/', (req, res) => res.send('PLT Server OK'));
app.listen(process.env.PORT || 3000, () => console.log('PLT Server running'));
