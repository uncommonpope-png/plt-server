// STRIPE CHECKOUT ENDPOINT
// Add this to server.js

const stripe = require('stripe')(process.env.STRIPE_SK);

const PRODUCTS = {
    'plt-bundle': {
        name: 'PLT Framework Complete Bundle',
        description: '18 books on the PLT framework for entrepreneurs',
        amount: 4900, // $49.00
        currency: 'usd',
        images: ['https://uncommonpope-png.github.io/plt-press/plt-logo.png']
    },
    'soul-profit': {
        name: 'Soul Profit Guide',
        description: "Entrepreneur's guide to building lasting wealth",
        amount: 2700, // $27.00
        currency: 'usd',
        images: []
    },
    'plt-calculator-pro': {
        name: 'PLT Calculator Pro',
        description: 'Advanced PLT decision scoring tool',
        amount: 1900, // $19.00
        currency: 'usd',
        images: []
    }
};

// POST /checkout - Create Stripe Checkout Session
async function createCheckout(req, res) {
    try {
        const { product, success_url, cancel_url } = req.body;
        
        const productData = PRODUCTS[product];
        if (!productData) {
            return res.status(400).json({ error: 'Unknown product' });
        }
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: productData.currency,
                    product_data: {
                        name: productData.name,
                        description: productData.description,
                        ...(productData.images.length ? { images: productData.images } : {})
                    },
                    unit_amount: productData.amount
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: success_url || 'https://uncommonpope-png.github.io/plt-press/success.html',
            cancel_url: cancel_url || 'https://uncommonpope-png.github.io/plt-press/bundle.html',
            metadata: { product, source: 'plt-press' }
        });
        
        res.json({ url: session.url, id: session.id });
        
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { createCheckout, PRODUCTS };