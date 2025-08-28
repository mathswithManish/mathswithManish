import React, { useEffect, useState } from "react";
import Protected from "../components/Protected";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

export default function Dashboard() {
  return <Protected>{(user)=> <Dash user={user} />}</Protected>;
}

function Dash({ user }) {
  const [purchases,setPurchases]=useState([]);
  const [logs,setLogs]=useState([]);

  useEffect(()=>{
    const load = async ()=>{
      const pq = query(collection(db,"purchases"), where("uid","==",user.uid));
      const p = await getDocs(pq);
      setPurchases(p.docs.map(d=>({id:d.id,...d.data()})));

      const lq = query(collection(db,"watchLogs"), where("uid","==",user.uid), orderBy("ts","desc"));
      const l = await getDocs(lq);
      setLogs(l.docs.map(d=>({id:d.id,...d.data()})));
    };
    load();
  },[user.uid]);

  return (
    <>
      <h2>My Courses</h2>
      <ul>
        {purchases.map(p=>(
          <li key={p.id}><Link href={`/course/${p.courseId}`}>{p.courseTitle}</Link> • ₹{p.amount/100}</li>
        ))}
      </ul>

      <h3 style={{marginTop:24}}>Backlog / Recent</h3>
      <ul>
        {logs.map(l=>(
          <li key={l.id}>
            {new Date(l.ts.seconds*1000).toLocaleString()} — {l.courseTitle} / {l.lectureTitle} — {Math.round(l.progress*100)}%
          </li>
        ))}
      </ul>
    </>
  );
}
