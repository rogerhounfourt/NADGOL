import { createRoot } from "react-dom/client";

// nadgolacademy.com.br e www mostram só a landing (landing.html); o app não deve nem carregar ali.
const ehLanding = /^(www\.)?nadgolacademy\.com\.br$/i.test(window.location.hostname);

// Depois de um deploy, uma aba antiga pode pedir um arquivo que não existe mais.
// Nesse caso recarrega sozinha (uma vez a cada 30 s, para nunca entrar em loop).
function recarregarUmaVez() {
  try {
    const ultima = Number(sessionStorage.getItem("nadgol-reload") ?? 0);
    if (Date.now() - ultima < 30_000) return false;
    sessionStorage.setItem("nadgol-reload", String(Date.now()));
  } catch { /* segue mesmo sem sessionStorage */ }
  window.location.reload();
  return true;
}
window.addEventListener("vite:preloadError", (e) => { e.preventDefault(); recarregarUmaVez(); });
(window as any).__nadgolRecarregar = recarregarUmaVez;

if (!ehLanding) {
  Promise.all([import("./App"), import("./index.css")]).then(([{ default: App }]) => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
}

// PWA: só em produção (no dev o service worker atrapalharia o hot reload).
if (!ehLanding && import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
