/**
 * WhatsApp Cloud API Service
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Supports:
 *  - Template messages (recommended for first contact)
 *  - Free-form text messages (only within 24-hr window)
 */

const GRAPH_API_URL = 'https://graph.facebook.com/v19.0';

// ─── Clean phone number ─────────────────────────────────────
function cleanPhone(phone) {
  // Remove spaces, dashes, parentheses, leading +
  return phone.replace(/[\s\-\(\)\+]/g, '');
}

// ─── Build template message body ───────────────────────────
function buildTemplatePayload({ phone, orderId, trackingLink }) {
  return {
    messaging_product: 'whatsapp',
    to: cleanPhone(phone),
    type: 'template',
    template: {
      name: process.env.WA_TEMPLATE_NAME || 'order_tracking',
      language: { code: process.env.WA_TEMPLATE_LANG || 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: orderId },
            { type: 'text', text: trackingLink }
          ]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: trackingLink }]
        }
      ]
    }
  };
}

// ─── Build free-form text message body ─────────────────────
function buildTextPayload({ phone, orderId, trackingLink, customMsg }) {
  const text = customMsg ||
    `Hello! 👋\n\nYour order *${orderId}* has been shipped! 🚚\n\nTrack your delivery here:\n${trackingLink}\n\nThank you for shopping with us!`;
  return {
    messaging_product: 'whatsapp',
    to: cleanPhone(phone),
    type: 'text',
    text: { body: text, preview_url: true }
  };
}

// ─── Core send function ─────────────────────────────────────
async function sendWhatsAppMessage({ phone, orderId, trackingLink, customMsg, useTemplate = true }) {
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const token = process.env.WA_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    throw new Error('WA_PHONE_NUMBER_ID or WA_ACCESS_TOKEN not configured in .env');
  }

  const payload = useTemplate
    ? buildTemplatePayload({ phone, orderId, trackingLink })
    : buildTextPayload({ phone, orderId, trackingLink, customMsg });

  const url = `${GRAPH_API_URL}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data?.error?.message || JSON.stringify(data);
    throw new Error(`WhatsApp API error (${response.status}): ${errMsg}`);
  }

  // Returns message ID from WhatsApp
  const messageId = data.messages?.[0]?.id;
  return { success: true, messageId, raw: data };
}

module.exports = { sendWhatsAppMessage };
