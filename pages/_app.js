import "../styles.css";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import NavBar from "../components/NavBar";

export default function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  useEffect(()=> onAuthStateChanged(auth, setUser), []);
  return (
    <>
      <NavBar user={user} />
      <main style={{maxWidth:960,margin:"0 auto",padding:16}}>
        <Component {...pageProps} user={user} />
      </main>
    </>
  );
}
