const express = require('express');
const router = express.Router();
const { updateStatusByWAMessageId, saveWebhookEvent } = require('../db/database');

const VERIFY_TOKEN = process.env.WA_WEBHOOK_VERIFY_TOKEN || 'wa_tracker_secret';

// ─── GET /webhook ─────────────────────────────────────────
// Meta verification handshake
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✓ Webhook verified by Meta');
    return res.status(200).send(challenge);
  }
  console.warn('✗ Webhook verification failed');
  res.sendStatus(403);
});

// ─── POST /webhook ────────────────────────────────────────
// Receive delivery status updates from Meta
router.post('/', (req, res) => {
  const body = req.body;

  // Always respond 200 quickly to Meta
  res.sendStatus(200);

  if (body.object !== 'whatsapp_business_account') return;

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const val = change.value;

      // Status updates (sent, delivered, read, failed)
      for (const status of val.statuses || []) {
        const { id: wa_message_id, status: event_type, errors } = status;
        console.log(`📬 Status update: ${wa_message_id} → ${event_type}`);

        // Update DB
        updateStatusByWAMessageId(wa_message_id, event_type);

        // Save raw event
        saveWebhookEvent({ wa_message_id, event_type, payload: status });
      }

      // Incoming messages (customer replies)
      for (const msg of val.messages || []) {
        console.log(`📩 Incoming message from ${msg.from}: ${msg.text?.body || '[media]'}`);
        saveWebhookEvent({
          wa_message_id: msg.id,
          event_type: 'inbound',
          payload: msg
        });
      }
    }
  }
});

module.exports = router;
