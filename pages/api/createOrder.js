import Razorpay from "razorpay";

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).end();
  const { price=499 } = req.body;
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  const order = await instance.orders.create({
    amount: Number(price)*100, currency:"INR", receipt: "rcpt_"+Date.now()
  });
  res.json({ orderId: order.id, amount: order.amount, key: process.env.RAZORPAY_KEY_ID });
}
