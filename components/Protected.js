import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useEffect, useState } from "react";

export default function Protected({ children }) {
  const [user, setUser] = useState(undefined);
  useEffect(()=> onAuthStateChanged(auth, setUser), []);
  if (user === undefined) return <p style={{padding:20}}>Loading…</p>;
  if (!user) return <p style={{padding:20}}>Please <a href="/login">login</a>.</p>;
  return children(user);
}
