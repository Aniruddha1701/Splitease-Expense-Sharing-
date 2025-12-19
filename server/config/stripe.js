const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent for settling up
const createPaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in paise
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true
            }
        });
        return paymentIntent;
    } catch (error) {
        console.error('❌ Stripe error:', error.message);
        throw error;
    }
};

// Create a checkout session for quick payments
const createCheckoutSession = async (amount, successUrl, cancelUrl, metadata = {}) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: 'SplitEase Settlement',
                        description: 'Settle your shared expenses'
                    },
                    unit_amount: Math.round(amount * 100)
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata
        });
        return session;
    } catch (error) {
        console.error('❌ Stripe checkout error:', error.message);
        throw error;
    }
};

module.exports = { stripe, createPaymentIntent, createCheckoutSession };
