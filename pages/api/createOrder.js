// pages/api/createOrder.js
const Razorpay = require("razorpay");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    // Optional: accept amount from client, otherwise use default price 499
    const defaultAmount = 499;
    const bodyAmount = req.body && (req.body.amount ?? null);
    const amount = bodyAmount ? Number(bodyAmount) : defaultAmount;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: Math.round(amount * 100), // rupees -> paise
      currency: "INR",
      receipt: `order_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,   // in paise
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error("Razorpay create order error:", err);
    return res.status(500).json({ error: "Order creation failed", details: err.message });
  }
}