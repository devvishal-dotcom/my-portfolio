const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../services/whatsapp');
const {
  createOrder, updateOrderStatus, getAllOrders,
  getStats, deleteOrder, getOrderById
} = require('../db/database');

// ─── POST /api/send ─────────────────────────────────────────
// Send WhatsApp notification to a customer
router.post('/send', async (req, res) => {
  const { phone, orderId, trackingLink, customMsg } = req.body;

  // Validation
  if (!phone || !orderId || !trackingLink) {
    return res.status(400).json({
      success: false,
      error: 'phone, orderId, and trackingLink are required'
    });
  }

  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return res.status(400).json({ success: false, error: 'Invalid phone number format' });
  }

  // Save to DB with pending status
  const order = createOrder({ order_id: orderId, phone, tracking_link: trackingLink, custom_msg: customMsg });

  try {
    // Send via WhatsApp API
    const result = await sendWhatsAppMessage({ phone, orderId, trackingLink, customMsg });

    // Update DB with success
    const updated = updateOrderStatus(order.id, {
      status: 'sent',
      wa_message_id: result.messageId
    });

    return res.json({
      success: true,
      messageId: result.messageId,
      order: updated
    });
  } catch (err) {
    // Update DB with failure
    updateOrderStatus(order.id, {
      status: 'failed',
      error_msg: err.message,
      retries: order.retries
    });

    return res.status(500).json({
      success: false,
      error: err.message,
      orderId: order.id
    });
  }
});

// ─── POST /api/send/bulk ────────────────────────────────────
// Bulk send — accepts array of orders, rate-limited to 1/sec
router.post('/send/bulk', async (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ success: false, error: 'orders array required' });
  }

  const results = [];
  for (const item of orders) {
    const { phone, orderId, trackingLink, customMsg } = item;
    if (!phone || !orderId || !trackingLink) {
      results.push({ orderId, status: 'skipped', reason: 'missing fields' });
      continue;
    }
    const order = createOrder({ order_id: orderId, phone, tracking_link: trackingLink, custom_msg: customMsg });
    try {
      const result = await sendWhatsAppMessage({ phone, orderId, trackingLink, customMsg });
      updateOrderStatus(order.id, { status: 'sent', wa_message_id: result.messageId });
      results.push({ orderId, status: 'sent', messageId: result.messageId });
    } catch (err) {
      updateOrderStatus(order.id, { status: 'failed', error_msg: err.message });
      results.push({ orderId, status: 'failed', error: err.message });
    }
    // Rate limit: 1 message per second to avoid WA limits
    await new Promise(r => setTimeout(r, 1000));
  }

  res.json({ success: true, total: orders.length, results });
});

// ─── POST /api/retry/:id ────────────────────────────────────
// Retry a failed order
router.post('/retry/:id', async (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  const updated = updateOrderStatus(order.id, { retries: order.retries + 1 });
  try {
    const result = await sendWhatsAppMessage({
      phone: order.phone,
      orderId: order.order_id,
      trackingLink: order.tracking_link,
      customMsg: order.custom_msg
    });
    const final = updateOrderStatus(order.id, { status: 'sent', wa_message_id: result.messageId });
    res.json({ success: true, order: final, messageId: result.messageId });
  } catch (err) {
    updateOrderStatus(order.id, { status: 'failed', error_msg: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/orders ────────────────────────────────────────
router.get('/orders', (req, res) => {
  const { limit = 100, offset = 0, status, search } = req.query;
  const orders = getAllOrders({
    limit: parseInt(limit),
    offset: parseInt(offset),
    status,
    search
  });
  res.json({ success: true, orders });
});

// ─── GET /api/orders/:id ────────────────────────────────────
router.get('/orders/:id', (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, order });
});

// ─── DELETE /api/orders/:id ─────────────────────────────────
router.delete('/orders/:id', (req, res) => {
  const result = deleteOrder(req.params.id);
  if (result.changes === 0) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true });
});

// ─── GET /api/stats ─────────────────────────────────────────
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: getStats() });
});

module.exports = router;
