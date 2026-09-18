import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
const app=initializeApp(firebaseConfig),auth=getAuth(app);
const form=document.getElementById("loginForm"),error=document.getElementById("loginError");
form.addEventListener("submit",async e=>{e.preventDefault();error.textContent="";try{await signInWithEmailAndPassword(auth,document.getElementById("email").value.trim(),document.getElementById("password").value);location.href="dashboard.html"}catch(err){error.textContent="Sign-in failed. Check your email and password."}});
document.getElementById("resetBtn").addEventListener("click",async()=>{const email=document.getElementById("email").value.trim();if(!email){error.textContent="Enter your email address first.";return}try{await sendPasswordResetEmail(auth,email);error.textContent="Password-reset email sent. Check your inbox."}catch(err){error.textContent="Unable to send the reset email."}});
