const { sql } = require('@vercel/postgres');

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id          SERIAL PRIMARY KEY,
        order_id    TEXT NOT NULL,
        phone       TEXT NOT NULL,
        tracking_link TEXT NOT NULL,
        custom_msg  TEXT,
        status      TEXT DEFAULT 'pending',
        wa_message_id TEXT,
        retries     INTEGER DEFAULT 0,
        error_msg   TEXT,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id          SERIAL PRIMARY KEY,
        wa_message_id TEXT,
        event_type  TEXT,
        payload     TEXT,
        received_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Database initialized (Vercel Postgres)');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

async function createOrder({ order_id, phone, tracking_link, custom_msg }) {
  const result = await sql`
    INSERT INTO orders (order_id, phone, tracking_link, custom_msg)
    VALUES (${order_id}, ${phone}, ${tracking_link}, ${custom_msg || null})
    RETURNING *
  `;
  return result.rows[0];
}

async function updateOrderStatus(id, { status, wa_message_id, error_msg, retries }) {
  const result = await sql`
    UPDATE orders SET
      status = COALESCE(${status || null}, status),
      wa_message_id = COALESCE(${wa_message_id || null}, wa_message_id),
      error_msg = COALESCE(${error_msg || null}, error_msg),
      retries = COALESCE(${retries ?? null}, retries),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

async function updateStatusByWAMessageId(wa_message_id, status) {
  await sql`
    UPDATE orders SET status = ${status}, updated_at = NOW()
    WHERE wa_message_id = ${wa_message_id}
  `;
}

async function getOrderById(id) {
  const result = await sql`SELECT * FROM orders WHERE id = ${id}`;
  return result.rows[0];
}

async function getAllOrders({ limit = 100, offset = 0, status, search } = {}) {
  let result;
  if (status && search) {
    result = await sql`SELECT * FROM orders WHERE status = ${status} AND (order_id ILIKE ${'%'+search+'%'} OR phone ILIKE ${'%'+search+'%'}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  } else if (status) {
    result = await sql`SELECT * FROM orders WHERE status = ${status} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  } else if (search) {
    result = await sql`SELECT * FROM orders WHERE order_id ILIKE ${'%'+search+'%'} OR phone ILIKE ${'%'+search+'%'} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  } else {
    result = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  }
  return result.rows;
}

async function getStats() {
  const total     = await sql`SELECT COUNT(*) as c FROM orders`;
  const sent      = await sql`SELECT COUNT(*) as c FROM orders WHERE status = 'sent'`;
  const delivered = await sql`SELECT COUNT(*) as c FROM orders WHERE status = 'delivered'`;
  const read      = await sql`SELECT COUNT(*) as c FROM orders WHERE status = 'read'`;
  const failed    = await sql`SELECT COUNT(*) as c FROM orders WHERE status = 'failed'`;
  const today     = await sql`SELECT COUNT(*) as c FROM orders WHERE created_at::date = CURRENT_DATE`;
  return {
    total:     parseInt(total.rows[0].c),
    sent:      parseInt(sent.rows[0].c),
    delivered: parseInt(delivered.rows[0].c),
    read:      parseInt(read.rows[0].c),
    failed:    parseInt(failed.rows[0].c),
    today:     parseInt(today.rows[0].c),
  };
}

async function deleteOrder(id) {
  const result = await sql`DELETE FROM orders WHERE id = ${id}`;
  return { changes: result.rowCount };
}

async function saveWebhookEvent({ wa_message_id, event_type, payload }) {
  await sql`
    INSERT INTO webhook_events (wa_message_id, event_type, payload)
    VALUES (${wa_message_id}, ${event_type}, ${JSON.stringify(payload)})
  `;
}

module.exports = {
  initDB, createOrder, updateOrderStatus, updateStatusByWAMessageId,
  getOrderById, getAllOrders, getStats, deleteOrder, saveWebhookEvent
};
