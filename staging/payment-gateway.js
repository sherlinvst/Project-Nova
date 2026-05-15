// paymentGateway.js
// Example Payment Gateway Integration using Stripe + Node.js + Express

const express = require("express");
const Stripe = require("stripe");

const app = express();

app.use(express.json());

// Initialize Stripe
const stripe = new Stripe("YOUR_STRIPE_SECRET_KEY");

// ==========================================
// CREATE PAYMENT INTENT
// ==========================================
app.post("/create-payment", async (req, res) => {
    try {
        const { amount, currency } = req.body;

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // amount in cents
            currency: currency || "usd",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// ==========================================
// PAYMENT STATUS CHECK
// ==========================================
app.get("/payment-status/:id", async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
            req.params.id
        );

        res.json({
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// ==========================================
// REFUND PAYMENT
// ==========================================
app.post("/refund", async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
        });

        res.json({
            success: true,
            refund,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// ==========================================
// WEBHOOK HANDLER
// ==========================================
app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    (req, res) => {
        const sig = req.headers["stripe-signature"];

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                "YOUR_WEBHOOK_SECRET"
            );

            switch (event.type) {

                case "payment_intent.succeeded":
                    console.log("Payment successful");
                    break;

                case "payment_intent.payment_failed":
                    console.log("Payment failed");
                    break;

                default:
                    console.log(Unhandled event: ${event.type});
            }

            res.json({ received: true });

        } catch (err) {
            console.error(err.message);

            res.status(400).send(Webhook Error: ${err.message});
        }
    }
);

// ==========================================
// START SERVER
// ==========================================
const PORT = 3000;

app.listen(PORT, () => {
    console.log(Payment Gateway Server running on port ${PORT});
});