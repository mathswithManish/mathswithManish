import { useEffect, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { installAntiPiracy } from "../lib/antiPiracy";

export default function VideoPlayer({ src, course, lecture, user }) {
  const vref = useRef(null);

  useEffect(()=>{
    const remove = installAntiPiracy(`${user?.email || "user"} • ${user?.uid?.slice?.(0,6) || ""}`);
    return () => remove && remove();
  },[user]);

  return (
    <video
      ref={vref}
      controls
      controlsList="nodownload noplaybackrate"
      onContextMenu={(e)=>e.preventDefault()}
      width="100%"
      src={src}
      style={{background:"#000",borderRadius:8}}
      onTimeUpdate={e=>{
        const v=e.target;
        const progress=v.duration ? v.currentTime/v.duration : 0;
        addDoc(collection(db,"watchLogs"),{
          uid: user?.uid || null,
          courseId: course.id,
          courseTitle: course.title,
          lectureTitle: lecture.title,
          progress,
          ts: serverTimestamp()
        });
      }}
    />
  );
}
