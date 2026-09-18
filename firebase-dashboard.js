import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
const app=initializeApp(firebaseConfig),auth=getAuth(app);
onAuthStateChanged(auth,user=>{if(!user)location.href="index.html";else{const b=document.getElementById("logout");if(b)b.onclick=async()=>{await signOut(auth);location.href="index.html"}}});
