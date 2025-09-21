import axios from "axios";

const baseURL =
  (window as any).__CONFIG__?.API_URL ||          // runtime override (see step 3)
  import.meta.env.VITE_API_URL ||                 // compile-time (Vite)
  `${location.protocol}//${location.hostname}:8000`;  // fallback for local

console.log("[API baseURL]", baseURL);
export default axios.create({ baseURL });