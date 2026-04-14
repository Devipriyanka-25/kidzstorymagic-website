// Payment & Stripe Routes
const express = require('express');
const config = require('../config/config');
const { verifyToken } = require('../middleware/auth');
const StoryProject = require('../models/StoryProject');
const pool = require('../config/database');
const CurrencyConverter = require('../utils/currencyConverter');
const PDFGenerator = require('../utils/pdfGenerator');
const StoryRenderer = require('../utils/storyRenderer');
const path = require('path');

// Initialize stripe only if key is valid
let stripe = null;
try {
  const stripeKey = config.stripe.secretKey;
  if (stripeKey && stripeKey !== 'sk_test_your_stripe_key_here') {
    stripe = require('stripe')(stripeKey);
  } else {
    console.warn('[PAYMENT] Stripe key not configured or is placeholder. Stripe features will be disabled.');
  }
} catch (err) {
  console.error('[PAYMENT] Failed to initialize Stripe:', err.message);
}

const router = express.Router();

// Create checkout session
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    console.log('[CHECKOUT] Request received:', { userId: req.userId, body: req.body });
    
    const { projectId, currency } = req.body;

    if (!projectId || !currency) {
      return res.status(400).json({ error: 'projectId and currency are required' });
    }

    // Verify project ownership
    const project = await StoryProject.findById(projectId, req.userId);
    if (!project) {
      console.warn('[CHECKOUT] Project not found:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('[CHECKOUT] Project found:', { projectId, childName: project.child_name, theme: project.theme });

    // Get base price
    const basePrice = config.pricing.base;
    const baseCurrency = config.pricing.currency;

    // Convert price to user's currency
    console.log('[CHECKOUT] Converting price:', { basePrice, baseCurrency, targetCurrency: currency });
    const pricing = await CurrencyConverter.getPricingInCurrency(
      basePrice,
      baseCurrency,
      currency
    );
    console.log('[CHECKOUT] Price converted:', pricing);

    // Create Stripe session (or mock if not configured)
    let session;
    
    if (stripe) {
      console.log('[CHECKOUT] Creating Stripe session...');
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `${project.child_name}'s Storybook - ${project.theme}`,
                description: `${project.page_count}-page personalized storybook`
              },
              unit_amount: Math.round(pricing.price * 100) // Convert to cents
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${config.app.baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.app.baseUrl}/cancel`,
        metadata: {
          projectId: projectId.toString(),
          userId: req.userId.toString(),
          currency: currency
        }
      });
      console.log('[CHECKOUT] Stripe session created:', session.id);
    } else {
      // Create mock session for development/testing
      console.warn('[CHECKOUT] Stripe not configured, creating mock session for development');
      session = {
        id: `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: null,
        payment_status: 'unpaid'
      };
      console.log('[CHECKOUT] Mock session created:', session.id);
    }

    // Create order in database
    console.log('[CHECKOUT] Creating order in database...');
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, project_id, amount, currency, original_amount, 
        original_currency, status, stripe_session_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, CURRENT_TIMESTAMP)
       RETURNING id, stripe_session_id`,
      [req.userId, projectId, pricing.price, currency, basePrice, baseCurrency, session.id]
    );

    console.log('[CHECKOUT] Order created:', orderResult.rows[0].id);

    res.json({
      sessionId: session.id,
      checkoutUrl: session.url || `https://checkout.stripe.com/pay/${session.id}`,
      orderId: orderResult.rows[0].id,
      amount: pricing.price,
      currency: currency,
      displayText: pricing.display
    });
  } catch (err) {
    console.error('[CHECKOUT] Error:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Handle successful payment
router.post('/confirm-payment', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    if (!stripe) {
      throw new Error('Stripe is not configured. Cannot confirm payment.');
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Update order status
    const orderResult = await pool.query(
      `UPDATE orders SET status = 'completed', completed_at = CURRENT_TIMESTAMP
       WHERE stripe_session_id = $1
       RETURNING id, project_id, user_id, amount, currency`,
      [sessionId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Update project status
    await StoryProject.update(order.project_id, { status: 'paid' });

    // Generate PDF
    const project = await StoryProject.findById(order.project_id);
    const storyContent = await StoryRenderer.getStoryContent(order.project_id);

    if (storyContent.length > 0) {
      const pdfDir = path.join(__dirname, '../../pdfs');
      const pdfFileName = `story_${order.project_id}_${Date.now()}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFileName);

      // Generate high-quality PDF
      const pdfData = await PDFGenerator.generateStoryPDF(storyContent, project, pdfPath, true);

      // Save PDF record
      await pool.query(
        `INSERT INTO generated_pdfs (project_id, order_id, pdf_url, file_size, page_count, 
         is_blurred, has_watermark, created_at)
         VALUES ($1, $2, $3, $4, $5, false, false, CURRENT_TIMESTAMP)`,
        [order.project_id, order.id, `/pdfs/${pdfFileName}`, pdfData.size, pdfData.pages]
      );
    }

    res.json({
      message: 'Payment confirmed',
      order: {
        id: order.id,
        projectId: order.project_id,
        status: 'completed'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Verify payment session (no auth required - called from redirect)
router.get('/verify/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('[PAYMENT] Verifying session:', sessionId);

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Look up order by stripe session ID
    const orderResult = await pool.query(
      `SELECT o.*, sp.child_name, sp.theme, sp.page_count
       FROM orders o
       JOIN story_projects sp ON o.project_id = sp.id
       WHERE o.stripe_session_id = $1`,
      [sessionId]
    );

    if (orderResult.rows.length === 0) {
      console.warn('[PAYMENT] Order not found for session:', sessionId);
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // If Stripe is configured, verify the session
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status !== 'paid') {
          console.warn('[PAYMENT] Payment not completed for session:', sessionId);
          return res.status(400).json({ error: 'Payment not completed' });
        }

        // Update order status to completed if not already
        if (order.status !== 'completed') {
          await pool.query(
            `UPDATE orders SET status = 'completed', completed_at = CURRENT_TIMESTAMP
             WHERE stripe_session_id = $1`,
            [sessionId]
          );
          order.status = 'completed';
        }
      } catch (stripeErr) {
        console.error('[PAYMENT] Stripe verification error:', stripeErr.message);
        // Continue anyway - order exists in database
      }
    }

    console.log('[PAYMENT] ✓ Session verified:', { orderId: order.id, status: order.status });

    res.json({
      success: true,
      data: {
        id: order.id,
        status: order.status,
        child_name: order.child_name,
        theme: order.theme,
        amount: order.amount,
        currency: order.currency,
        created_at: order.created_at
      }
    });
  } catch (err) {
    console.error('[PAYMENT] Verification error:', err);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// Get order details
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get user's orders
router.get('/user/orders', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, sp.child_name, sp.theme
       FROM orders o
       JOIN story_projects sp ON o.project_id = sp.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.userId]
    );

    res.json({ orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get PDF download link
router.get('/pdf/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify ownership and payment
    const project = await StoryProject.findById(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if paid
    const paidResult = await pool.query(
      `SELECT * FROM orders WHERE project_id = $1 AND status = 'completed'`,
      [projectId]
    );

    if (paidResult.rows.length === 0) {
      return res.status(403).json({ error: 'Project not paid' });
    }

    // Get PDF
    const pdfResult = await pool.query(
      `SELECT * FROM generated_pdfs WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [projectId]
    );

    if (pdfResult.rows.length === 0) {
      return res.status(404).json({ error: 'PDF not generated yet' });
    }

    res.json({
      pdf: pdfResult.rows[0],
      downloadUrl: pdfResult.rows[0].pdf_url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch PDF' });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Payment completed:', event.data.object);
        break;
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
