import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Stripe from 'stripe';
import User from '../models/User.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Créer une session de paiement
router.post('/create-payment-intent', protect, async (req, res) => {
    try {
        console.log("Début de la création de session de paiement");
        const userId = req.user._id;
        console.log("User ID:", userId);

        // Récupérer l'utilisateur avec ses articles de panier
        const user = await User.findById(userId).populate('cart.product');
        console.log("User data:", user);
        console.log("Cart data:", user?.cart);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si l'utilisateur a un panier
        if (!user.cart || !Array.isArray(user.cart) || user.cart.length === 0) {
            return res.status(400).json({ message: 'Panier vide' });
        }

        // Générer l'URL Checkout pour le Web Browser
        console.log("Création de la session Checkout");
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: user.cart.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.product.name,
                        images: item.product.imageUrl ? [item.product.imageUrl] : [],
                    },
                    unit_amount: Math.round(item.product.price * 100),
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            payment_intent_data: {
                metadata: {
                    userId: userId.toString(),
                    cartItems: JSON.stringify(user.cart.map(item => ({
                        productId: item.product._id.toString(),
                        quantity: item.quantity
                    })))
                }
            },
            success_url: process.env.STRIPE_SUCCESS_URL || `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: process.env.STRIPE_CANCEL_URL || `${process.env.FRONTEND_URL}/cart`,
        });

        console.log("Session Checkout créée:", session.id);
        console.log("URL de la session:", session.url);

        // Répondre avec les informations nécessaires
        res.status(200).json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Erreur détaillée lors de la création de la session de paiement:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            message: error.message,
            stack: error.stack,
            details: error.toString()
        });
    }
});

// Vérifier le statut d'un paiement
router.get('/check-status/:sessionId', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id.toString();

        // Récupérer la session depuis Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Si la session a un paymentIntent, récupérez-le
        let paymentIntent;
        if (session.payment_intent) {
            paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        }

        // Vérifier que cette session appartient à l'utilisateur
        if (paymentIntent && paymentIntent.metadata.userId !== userId) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource" });
        }

        // Si le paiement est réussi et qu'aucune commande n'existe déjà, créer une nouvelle commande
        let orderId = null;
        if (session.payment_status === 'paid') {
            // Vérifier si une commande existe déjà pour cette session
            const existingOrder = await Order.findOne({ sessionId });

            if (!existingOrder) {
                // Récupérer les détails des articles du panier depuis les métadonnées du paymentIntent
                const cartItems = JSON.parse(paymentIntent.metadata.cartItems || '[]');

                // Créer une nouvelle commande
                const newOrder = new Order({
                    user: userId,
                    products: cartItems.map(item => ({
                        product: item.productId,
                        quantity: item.quantity
                    })),
                    totalAmount: session.amount_total / 100,
                    status: 'processing',
                    paymentMethod: 'card',
                    paymentResult: {
                        id: session.payment_intent,
                        status: session.payment_status,
                        update_time: new Date().toISOString(),
                        email_address: session.customer_details?.email || 'not_provided'
                    }
                });

                const savedOrder = await newOrder.save();
                orderId = savedOrder._id;

                // Vider le panier de l'utilisateur après un paiement réussi
                await User.findByIdAndUpdate(
                    userId,
                    { $set: { cart: [] } }
                );
            } else {
                orderId = existingOrder._id;
            }
        }

        // Renvoyer le statut du paiement
        res.status(200).json({
            status: session.payment_status,
            orderId: orderId
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du statut du paiement:', error);
        res.status(500).json({ message: error.message });
    }
});

// Récupérer l'URL de la facture
router.get('/invoice/:sessionId', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id.toString();

        // Récupérer la session depuis Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Si la session a un paymentIntent, récupérez-le
        let paymentIntent;
        if (session.payment_intent) {
            paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        }

        // Vérifier que cette session appartient à l'utilisateur
        if (paymentIntent && paymentIntent.metadata.userId !== userId) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource" });
        }

        // Générer l'URL du reçu (plusieurs options possibles)
        let invoiceUrl;

        // Essayer de récupérer le reçu directement depuis la session
        if (session.receipt_url) {
            invoiceUrl = session.receipt_url;
        } else {
            // URL alternative basée sur le payment intent
            invoiceUrl = `https://dashboard.stripe.com/test/payments/${session.payment_intent}`;
        }

        // Renvoyer l'URL de la facture
        res.status(200).json({
            invoiceUrl: invoiceUrl
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la facture:', error);
        res.status(500).json({ message: error.message });
    }
});

// Webhook pour les événements Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    let event;
    try {
        const signature = req.headers['stripe-signature'];

        // Vérifier si un secret de webhook est configuré
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.warn('STRIPE_WEBHOOK_SECRET non configuré, traitement des webhooks non sécurisé');
            event = JSON.parse(req.body);
        } else {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        }
    } catch (err) {
        console.error('Erreur de signature webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer les événements
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout session completed:', session.id);

            try {
                // Récupérer les détails du paymentIntent
                const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                const userId = paymentIntent.metadata.userId;

                if (!userId) {
                    console.error('UserId manquant dans les métadonnées du paymentIntent');
                    break;
                }

                // Vérifier si une commande existe déjà
                const existingOrder = await Order.findOne({ sessionId: session.id });

                if (!existingOrder) {
                    // Récupérer les détails des articles du panier
                    const cartItems = JSON.parse(paymentIntent.metadata.cartItems || '[]');

                    // Créer une nouvelle commande
                    const newOrder = new Order({
                        user: userId,
                        products: cartItems.map(item => ({
                            product: item.productId,
                            quantity: item.quantity
                        })),
                        totalAmount: session.amount_total / 100,
                        status: 'processing',
                        paymentMethod: 'card',
                        paymentResult: {
                            id: session.payment_intent,
                            status: session.payment_status,
                            update_time: new Date().toISOString(),
                            email_address: session.customer_details?.email || 'not_provided'
                        }
                    });
                    await newOrder.save();

                    // Vider le panier de l'utilisateur
                    await User.findByIdAndUpdate(
                        userId,
                        { $set: { cart: [] } }
                    );
                }
            } catch (error) {
                console.error('Erreur lors du traitement du webhook checkout.session.completed:', error);
            }
            break;

        case 'payment_intent.payment_failed':
            const failedPaymentIntent = event.data.object;
            console.log('PaymentIntent échoué:', failedPaymentIntent.id);
            break;
    }

    // Retourner une réponse pour confirmer la réception
    res.json({ received: true });
});

export default router;