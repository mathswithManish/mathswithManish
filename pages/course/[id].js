import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import VideoPlayer from "../../components/VideoPlayer";

export default function Course({ user }) {
  const { query } = useRouter();
  const [course,setCourse]=useState(null);
  const [scriptLoaded,setScriptLoaded]=useState(false);

  useEffect(()=>{
    if(!query.id) return;
    getDoc(doc(db,"courses",query.id)).then(s=>{
      if(s.exists()) setCourse({id:s.id,...s.data()});
    });
  },[query.id]);

  useEffect(()=>{
    const s=document.createElement("script");
    s.src="https://checkout.razorpay.com/v1/checkout.js";
    s.onload=()=>setScriptLoaded(true);
    document.body.appendChild(s);
  },[]);

  if(!course) return <p>Loading…</p>;

  const buy = async ()=>{
    const res = await fetch("/api/createOrder",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ price: course.price })
    });
    const data = await res.json();
    const rzp = new window.Razorpay({
      key: data.key, amount:data.amount, currency:"INR",
      name: course.title, description:"Course purchase",
      order_id: data.orderId,
      handler: async (response)=>{
        const v = await fetch("/api/verifyPayment",{
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ ...response, course })
        });
        const ok = await v.json();
        alert(ok.success ? "Purchase successful" : "Payment verification failed");
      }
    });
    rzp.open();
  };

  return (
    <div>
      <h2>{course.title}</h2>
      <p>₹{course.price} • {(course.lectures||[]).length} lectures</p>
      <button onClick={buy} disabled={!scriptLoaded}>Buy Course</button>

      <h3 style={{marginTop:18}}>Lectures</h3>
      {(course.lectures||[]).map((lec,i)=>(
        <div key={i} style={{margin:"12px 0",padding:12,border:"1px solid #eee",borderRadius:8}}>
          <b>{lec.title}</b>
          <VideoPlayer src={lec.url} course={course} lecture={lec} user={user} />
        </div>
      ))}
    </div>
  );
}
