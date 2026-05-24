# 📦 WhatsApp Order Tracker

A full-stack system to send order tracking notifications to customers via **WhatsApp Business Cloud API**, with a **SQLite database** and a polished **Admin Panel UI**.

---

## 🏗️ Architecture

```
Admin Panel (HTML/JS)
        │
        ▼ HTTP POST /api/send
┌───────────────────┐
│   Node.js + Express│
│   (Backend API)   │
└────────┬──────────┘
         │
    ┌────┴────┐
    │  SQLite  │   ← stores all orders + status
    └──────────┘
         │
    WhatsApp Cloud API (Meta)
         │
         ▼
    Customer's WhatsApp
         │
    Delivery receipts via Webhook
         ▼
    DB status updated (sent → delivered → read)
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your WA_PHONE_NUMBER_ID and WA_ACCESS_TOKEN
```

### 3. Start the server
```bash
npm run dev        # development with auto-reload
npm start          # production
```

---

## 🔑 Getting WhatsApp API Credentials

### Step 1 — Create a Meta Developer App
1. Go to https://developers.facebook.com
2. Click **My Apps → Create App**
3. Choose **Business** type
4. Add **WhatsApp** product

### Step 2 — Get Phone Number ID & Token
1. In your app, go to **WhatsApp → API Setup**
2. Copy the **Phone Number ID**
3. Generate a **Permanent Access Token** (System User in Business Manager)
4. Paste both into `.env`

### Step 3 — Create a Message Template
1. Go to **WhatsApp → Message Templates → Create Template**
2. Name: `order_tracking`  
3. Category: `UTILITY`
4. Language: `en_US`
5. Body text example:
   ```
   Hello! Your order *{{1}}* has been shipped 🚚
   Track it here: {{2}}
   Thank you for your purchase!
   ```
6. Add a **URL button** with `{{1}}` as the dynamic URL
7. Submit for approval (usually instant for utility templates)

### Step 4 — Set Up Webhook (for delivery receipts)
1. Expose your server via ngrok: `ngrok http 3000`
2. In Meta app → **WhatsApp → Configuration → Webhook**
3. Callback URL: `https://YOUR_NGROK_URL/webhook`
4. Verify token: (same as `WA_WEBHOOK_VERIFY_TOKEN` in `.env`)
5. Subscribe to: `messages`

---

## 📡 API Reference

### Send a Notification
```
POST /api/send
Content-Type: application/json

{
  "phone": "+919876543210",
  "orderId": "ORD-2024-001",
  "trackingLink": "https://track.example.com/ABC123",
  "customMsg": "(optional) override the default message"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "wamid.HBgM...",
  "order": { "id": 1, "status": "sent", ... }
}
```

---

### Bulk Send
```
POST /api/send/bulk
Content-Type: application/json

{
  "orders": [
    { "phone": "+91...", "orderId": "ORD-001", "trackingLink": "https://..." },
    { "phone": "+91...", "orderId": "ORD-002", "trackingLink": "https://..." }
  ]
}
```

---

### List Orders
```
GET /api/orders?limit=50&offset=0&status=sent&search=ORD-001
```

### Get Stats
```
GET /api/stats
```

### Retry Failed Order
```
POST /api/retry/:id
```

### Delete Order
```
DELETE /api/orders/:id
```

### Health Check
```
GET /api/health
```

---

## 🗄️ Database Schema

### `orders` table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment PK |
| order_id | TEXT | Your order reference |
| phone | TEXT | Customer WhatsApp number |
| tracking_link | TEXT | Full tracking URL |
| custom_msg | TEXT | Custom message (optional) |
| status | TEXT | pending / sent / failed / delivered / read |
| wa_message_id | TEXT | WhatsApp message ID |
| retries | INTEGER | Retry count |
| error_msg | TEXT | Error details if failed |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

### `webhook_events` table
Stores all raw delivery receipts and status updates from WhatsApp.

---

## 📦 Bulk CSV Upload

The Admin Panel supports CSV uploads with format:
```csv
phone,order_id,tracking_link
+919876543210,ORD-001,https://track.example.com/ABC
+919876543211,ORD-002,https://track.example.com/DEF
```

---

## 🚀 Deploy to Production

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name wa-tracker
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 📝 Notes
- WhatsApp allows **free-form messages only within 24h** of customer initiating contact.
- For outbound business-initiated messages, always use **approved templates**.
- Rate limit: ~80 messages/second per phone number (WhatsApp Cloud API).
- The admin panel connects to `http://localhost:3000` by default — update in **API Settings**.
