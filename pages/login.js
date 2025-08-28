import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [mode,setMode]=useState("login");
  const submit = async e=>{
    e.preventDefault();
    if(mode==="login") await signInWithEmailAndPassword(auth,email,password);
    else await createUserWithEmailAndPassword(auth,email,password);
    window.location.href="/dashboard";
  };
  return (
    <div style={{maxWidth:420}}>
      <h2>{mode==="login"?"Login":"Register"}</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        <button type="submit">{mode==="login"?"Login":"Create account"}</button>
      </form>
      <button onClick={()=>setMode(mode==="login"?"signup":"login")}>
        {mode==="login"?"New user? Sign up":"Have account? Login"}
      </button>
    </div>
  );
}
