// pages/api/createOrder.js
const Razorpay = require("razorpay");

/**
 * Behavior:
 * - If req.body.amount is present, try to use it (after validation).
 * - If not present, use DEFAULT_PRICE (499).
 * - Validation: amount must be integer/number, >= MIN_PRICE and <= MAX_PRICE,
 *   AND if ALLOWED_AMOUNTS is provided (comma separated in ENV) must be one of them.
 */

const DEFAULT_PRICE = 499; // in rupees (fallback)
const MIN_PRICE = 10;      // smallest allowed (rupees)
const MAX_PRICE = 50000;   // largest allowed (rupees)

function parseAllowedAmounts(env) {
  if (!env) return null;
  return env.split(",").map(s => {
    const n = Number(s.trim());
    return Number.isFinite(n) ? n : null;
  }).filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    // read amount from request (optional)
    const bodyAmount = req.body && (req.body.amount ?? req.body.price ?? null);

    // compute allowed amounts from env (optional)
    const allowed = parseAllowedAmounts(process.env.ALLOWED_AMOUNTS); // e.g. "499,999,1499"

    // decide final amount in rupees
    let amount = DEFAULT_PRICE;
    if (bodyAmount != null) {
      const n = Number(bodyAmount);
      if (!Number.isFinite(n) || n <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      // integer or decimal allowed — treat as rupees (you can restrict to integer if you want)
      // validation: range
      if (n < MIN_PRICE || n > MAX_PRICE) {
        return res.status(400).json({ error: `Amount must be between ${MIN_PRICE} and ${MAX_PRICE} rupees` });
      }
      // if allowed list exists, enforce it
      if (allowed && !allowed.includes(n)) {
        return res.status(400).json({ error: "This amount is not allowed" });
      }
      amount = n;
    }

    // Razorpay expects amount in paise (integer)
    const amountInPaise = Math.round(amount * 100);

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount, // in paise
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error("Razorpay create order error:", err);
    return res.status(500).json({ error: "Order creation failed", details: err.message });
  }
}