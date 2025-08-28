import crypto from "crypto";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).end();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, course } = req.body;

  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");

  const success = expected === razorpay_signature;

  if(success){
    await addDoc(collection(db,"purchases"),{
      uid: null, // V2: idToken verify karke real uid save karenge
      courseId: course.id,
      courseTitle: course.title,
      amount: course.price*100,
      ts: serverTimestamp()
    });
  }
  res.json({ success });
}
