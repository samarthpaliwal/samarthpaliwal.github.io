const root = document.documentElement;

function setTheme(theme){
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute("content", theme === "dark" ? "#0b0f17" : "#f6f7fb");
}

(function initTheme(){
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(saved || (prefersDark ? "dark" : "light"));
})();

window.toggleTheme = function(){
  const current = root.getAttribute("data-theme") || "light";
  setTheme(current === "dark" ? "light" : "dark");
};

window.setYear = function(){
  const y = document.getElementById("y");
  if(y) y.textContent = new Date().getFullYear();
};

// Auto-load thumbnails if images exist (no broken images)
window.autoThumbs = async function(){
  const thumbs = document.querySelectorAll(".thumb[data-img]");
  for (const t of thumbs){
    const path = t.getAttribute("data-img");
    try{
      const res = await fetch(path, { method: "HEAD" });
      if(res.ok){
        const img = t.querySelector("img");
        img.src = path;
        t.classList.add("hasImg");
      }
    }catch(e){
      // ignore
    }
  }
};