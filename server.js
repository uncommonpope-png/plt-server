const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const chat = [];
let msgId = 1;

// Betty Credits — PLT Knowledge Engine (zero API cost)
const BETTY_KNOWLEDGE = {
  greetings: ["Hey! I'm Betty Credits. Ask me about credit, money, or PLT. I keep it real.", "Betty Credits here. What's on your mind — credit, business, or the PLT framework?", "Welcome to Betty's desk. Let's talk money moves."],
  
  plt: {
    what: "PLT stands for Profit · Love · Tax. It's a framework created by Craig Jones for scoring every interaction in your life.\n\n💰 PROFIT = What you gain (money, leverage, position, assets)\n❤️ LOVE = Relationship capital (trust, alliances, community)\n📉 TAX = The real cost (time, energy, money spent, opportunity cost)\n\nThe equation: SOUL PROFIT = PROFIT + LOVE - TAX\n\nApply it to any deal, conversation, or decision to see if it's building your life or draining it.",
    profit: "PROFIT in PLT isn't just money. It's leverage, position, assets, influence — anything that increases your power in a situation. When you close a deal, gain a skill, or build a system that works without you, your Profit score goes up.",
    love: "LOVE in PLT is relationship capital. Trust built over time. Alliances formed. Community strengthened. Love is compound interest for humans — it grows slowly but pays massive dividends. Don't confuse it with being soft. Strategic Love is the most powerful force in business.",
    tax: "TAX is what kills most people silently. It's not just money — it's time, energy, emotional weight, opportunity cost. Every yes is an obligation. Every meeting is a Tax. The goal isn't zero Tax — it's knowing exactly what you're paying and making sure the Profit + Love is worth it.",
    score: "To score a conversation using PLT:\n1. Rate PROFIT 1-10: What did you gain?\n2. Rate LOVE 1-10: Did the relationship strengthen?\n3. Rate TAX 1-10: What did it cost you?\n4. Calculate: SOUL PROFIT = P + L - T\n\nScore above 10 = great interaction\nScore 5-10 = decent\nBelow 5 = you're losing\n\nDo this after every important conversation. You'll start seeing patterns."
  },

  credit: {
    basics: "Credit is your financial reputation. Three numbers control it:\n• Payment history (35%) — Pay on time, every time\n• Credit utilization (30%) — Keep under 30%, ideally under 10%\n• Length of history (15%) — Don't close old accounts\n• Credit mix (10%) — Have different types\n• New inquiries (10%) — Don't apply for everything\n\nPLT Score: Building credit = high Profit (future leverage), moderate Tax (discipline required), high Love (lenders trust you).",
    repair: "Credit repair in 5 steps:\n1. Pull all 3 reports (annualcreditreport.com — free)\n2. Dispute every error in writing\n3. Negotiate pay-for-delete on collections\n4. Become an authorized user on someone's old card\n5. Get a secured credit card and use 5-10% monthly\n\nThe PLT angle: Credit repair is high Profit (unlocks everything), high Love (you're building trust with the system), medium Tax (takes 3-6 months of discipline).",
    business: "Business credit is separate from personal. Start here:\n1. Get an EIN from IRS (free)\n2. Register with Dun & Bradstreet (DUNS number)\n3. Open a business bank account\n4. Get a business credit card (Capital One Spark, etc.)\n5. Pay net-30 vendors that report to business bureaus\n\nPLT: Business credit = massive Profit (leverage for funding), strong Love (builds business reputation), moderate Tax (setup time).",
    score_ranges: "Credit score ranges:\n• 800-850: Exceptional — best rates on everything\n• 740-799: Very Good — most approvals\n• 670-739: Good — decent rates\n• 580-669: Fair — subprime territory\n• 300-579: Poor — rebuilding time\n\nEvery 20 points up can save you thousands on a mortgage. That's pure Profit with zero Tax."
  },

  money: {
    basics: "Financial literacy PLT style:\n• Save 20% of income (reduces future Tax)\n• Invest in assets, not liabilities (builds Profit)\n• Build relationships with money people (builds Love)\n• Track every dollar (Tax awareness)\n\nMost people have high Tax (spending) and low Profit (no assets). Flip the ratio.",
    invest: "Investment hierarchy:\n1. Emergency fund (3-6 months) — Tax insurance\n2. High-yield savings — Easy Profit\n3. Index funds (S&P 500) — Long-term Profit\n4. Real estate — Profit + Love (community)\n5. Business — Highest Profit, highest Tax\n\nNever invest money you need in 5 years. That's a Tax trap.",
    real_estate: "Real estate through PLT:\n• PROFIT: Appreciation, rental income, equity\n• LOVE: Community building, tenant relationships, agent network\n• TAX: Mortgage, maintenance, time, stress\n\nThe play: Buy in areas where Love is growing (communities improving). Profit follows Love in real estate. Always calculate the full Tax — not just the mortgage."
  },

  books: "Craig Jones wrote 18 books on the PLT framework:\n\n📚 The Scorer Series — Score any conversation\n📚 Reality Building — Build systems that work\n📚 PLT Doctrine — The core philosophy\n📚 PLT Fiction — Stories that teach\n\nGet all 18 for $49: uncommonpope-png.github.io/plt-press/bundle.html",

  services: "PLT Press offers:\n• AI Agent Setup: $100\n• Social Media Package: $75\n• Email Automation: $75\n• Business Document Package: $150\n\nAll built using PLT principles. Visit: uncommonpope-png.github.io/plt-press/services.html"
};

function bettyRespond(text) {
  const t = text.toLowerCase();
  
  // Greetings
  if (t.match(/^(hi|hey|hello|yo|sup|what's up|betty)/)) {
    return BETTY_KNOWLEDGE.greetings[Math.floor(Math.random() * BETTY_KNOWLEDGE.greetings.length)];
  }
  
  // PLT specific
  if (t.includes('what is plt') || t.includes('what\'s plt') || t.includes('explain plt') || (t.includes('plt') && t.includes('mean'))) return BETTY_KNOWLEDGE.plt.what;
  if (t.includes('profit') && !t.includes('love') && !t.includes('tax')) return BETTY_KNOWLEDGE.plt.profit;
  if (t.includes('love') && !t.includes('profit') && !t.includes('tax')) return BETTY_KNOWLEDGE.plt.love;
  if (t.includes('tax') && !t.includes('profit') && !t.includes('love')) return BETTY_KNOWLEDGE.plt.tax;
  if (t.includes('score') && (t.includes('conversation') || t.includes('how'))) return BETTY_KNOWLEDGE.plt.score;
  if (t.includes('plt') || t.includes('framework') || t.includes('soul profit')) return BETTY_KNOWLEDGE.plt.what;
  
  // Credit
  if (t.includes('credit repair') || t.includes('fix credit') || t.includes('improve credit')) return BETTY_KNOWLEDGE.credit.repair;
  if (t.includes('business credit') || t.includes('business loan')) return BETTY_KNOWLEDGE.credit.business;
  if (t.includes('credit score') && (t.includes('range') || t.includes('good') || t.includes('what'))) return BETTY_KNOWLEDGE.credit.score_ranges;
  if (t.includes('credit')) return BETTY_KNOWLEDGE.credit.basics;
  
  // Money
  if (t.includes('invest') || t.includes('stock') || t.includes('index fund')) return BETTY_KNOWLEDGE.money.invest;
  if (t.includes('real estate') || t.includes('property') || t.includes('house') || t.includes('mortgage')) return BETTY_KNOWLEDGE.money.real_estate;
  if (t.includes('money') || t.includes('financ') || t.includes('save') || t.includes('budget')) return BETTY_KNOWLEDGE.money.basics;
  
  // Books & Services
  if (t.includes('book')) return BETTY_KNOWLEDGE.books;
  if (t.includes('service') || t.includes('hire') || t.includes('help me')) return BETTY_KNOWLEDGE.services;
  
  // Default
  return "I hear you. Ask me about:\n• PLT framework (Profit · Love · Tax)\n• Credit repair & building\n• Business credit\n• Financial literacy\n• Investment basics\n• Real estate\n• Craig Jones' books\n\nI keep it real — what do you want to know?";
}

// Dashboard sends message
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

// Betty Credits — Zero cost knowledge engine
app.post('/betty', (req, res) => {
  const { text } = req.body;
  if (!text) return res.json({ ok: false, error: 'No text' });
  const reply = bettyRespond(text);
  res.json({ ok: true, reply });
});

app.post('/webhook', (req, res) => {
  const msg = req.body?.message;
  if (msg && msg.text) {
    chat.push({ id: msgId++, who: 'visitor', text: msg.text, time: new Date().toISOString() });
  }
  res.json({ ok: true });
});

app.get('/', (req, res) => res.send('PLT Server OK'));
app.listen(process.env.PORT || 3000, () => console.log('PLT Server running'));
