import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { BRAND } from "../lib/appConfig";

export default function NavBar({ user }) {
  return (
    <nav style={{display:"flex",gap:16,alignItems:"center",padding:12,borderBottom:"1px solid #eee"}}>
      <b>{BRAND}</b>
      <Link href="/">Courses</Link>
      {user ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <button onClick={()=>signOut(auth)}>Logout</button>
        </>
      ) : <Link href="/login">Login</Link>}
    </nav>
  );
      }
