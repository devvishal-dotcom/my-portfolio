const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../services/whatsapp');
const { requirePermission } = require('../middleware/auth');
const {
  createOrder, updateOrderStatus, getAllOrders,
  getStats, deleteOrder, getOrderById
} = require('../db/database');

// Send — operator + admin only
router.post('/send', requirePermission('send'), async (req, res) => {
  const { phone, orderId, trackingLink, customMsg } = req.body;
  if (!phone || !orderId || !trackingLink) {
    return res.status(400).json({ success: false, error: 'phone, orderId, and trackingLink are required' });
  }
  const order = await createOrder({ order_id: orderId, phone, tracking_link: trackingLink, custom_msg: customMsg });
  try {
    const result = await sendWhatsAppMessage({ phone, orderId, trackingLink, customMsg });
    const updated = await updateOrderStatus(order.id, { status: 'sent', wa_message_id: result.messageId });
    return res.json({ success: true, messageId: result.messageId, order: updated });
  } catch (err) {
    await updateOrderStatus(order.id, { status: 'failed', error_msg: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk send — operator + admin only
router.post('/send/bulk', requirePermission('send'), async (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ success: false, error: 'orders array required' });
  }
  const results = [];
  for (const item of orders) {
    const { phone, orderId, trackingLink, customMsg } = item;
    if (!phone || !orderId || !trackingLink) { results.push({ orderId, status: 'skipped' }); continue; }
    const order = await createOrder({ order_id: orderId, phone, tracking_link: trackingLink, custom_msg: customMsg });
    try {
      const result = await sendWhatsAppMessage({ phone, orderId, trackingLink, customMsg });
      await updateOrderStatus(order.id, { status: 'sent', wa_message_id: result.messageId });
      results.push({ orderId, status: 'sent', messageId: result.messageId });
    } catch (err) {
      await updateOrderStatus(order.id, { status: 'failed', error_msg: err.message });
      results.push({ orderId, status: 'failed', error: err.message });
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  res.json({ success: true, total: orders.length, results });
});

// Retry — operator + admin only
router.post('/retry/:id', requirePermission('retry'), async (req, res) => {
  const order = await getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  try {
    const result = await sendWhatsAppMessage({ phone: order.phone, orderId: order.order_id, trackingLink: order.tracking_link });
    const final = await updateOrderStatus(order.id, { status: 'sent', wa_message_id: result.messageId, retries: order.retries + 1 });
    res.json({ success: true, order: final });
  } catch (err) {
    await updateOrderStatus(order.id, { status: 'failed', error_msg: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// View orders — all roles
router.get('/orders', requirePermission('view'), async (req, res) => {
  const { limit = 100, offset = 0, status, search } = req.query;
  const orders = await getAllOrders({ limit: parseInt(limit), offset: parseInt(offset), status, search });
  res.json({ success: true, orders });
});

router.get('/orders/:id', requirePermission('view'), async (req, res) => {
  const order = await getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, order });
});

// Delete — admin only
router.delete('/orders/:id', requirePermission('delete'), async (req, res) => {
  const result = await deleteOrder(req.params.id);
  if (result.changes === 0) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true });
});

// Stats — all roles
router.get('/stats', requirePermission('stats'), async (req, res) => {
  res.json({ success: true, stats: await getStats() });
});

module.exports = router;
