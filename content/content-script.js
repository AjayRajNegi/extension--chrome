// YouTube Black Screen — content-script.js
// Injects a dismissible black screen inside #contents before the video grid

const STORAGE_KEY = "yt_blackscreen_enabled";
const OVERLAY_ID = "yt-blackscreen-overlay";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isHomePage() {
  return location.pathname === "/";
}

function getContents() {
  // Primary selector used on the homepage feed
  return (
    document.querySelector("ytd-browse #contents") ||
    document.querySelector("#contents")
  );
}

function overlayExists() {
  return !!document.getElementById(OVERLAY_ID);
}

// ─── Create the overlay ───────────────────────────────────────────────────────

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;

  overlay.style.cssText = `
    width: 100%;
    background: #000;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 48px 24px;
    box-sizing: border-box;
    margin-bottom: 24px;
    min-height: 100vh;
    position: relative;
    font-family: 'Google Sans', Roboto, sans-serif;
  `;

  // ── Icon ──
  const icon = document.createElement("div");
  icon.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" stroke="#444" stroke-width="2"/>
      <path d="M16 16L32 32M32 16L16 32" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `;
  icon.style.cssText = "opacity:0.6;";

  // ── Heading ──
  const heading = document.createElement("p");
  heading.textContent = "Home feed is hidden";
  heading.style.cssText = `
    margin: 0;
    color: #aaa;
    font-size: 17px;
    font-weight: 500;
    letter-spacing: 0.01em;
  `;

  // ── Sub-text ──
  const sub = document.createElement("p");
  sub.textContent = "Stay intentional. Click below to reveal videos.";
  sub.style.cssText = `
    margin: 0;
    color: #555;
    font-size: 13px;
  `;

  // ── Reveal button ──
  const btn = document.createElement("button");
  btn.textContent = "Show videos";
  btn.style.cssText = `
    margin-top: 8px;
    padding: 10px 28px;
    background: #222;
    color: #fff;
    border: 1px solid #444;
    border-radius: 999px;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  `;
  btn.addEventListener("mouseenter", () => {
    btn.style.background = "#333";
    btn.style.borderColor = "#777";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "#222";
    btn.style.borderColor = "#444";
  });
  btn.addEventListener("click", () => {
    overlay.style.transition = "opacity 0.4s";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 400);
  });

  overlay.appendChild(icon);
  overlay.appendChild(heading);
  overlay.appendChild(sub);
  overlay.appendChild(btn);

  return overlay;
}

// ─── Inject ───────────────────────────────────────────────────────────────────

function injectOverlay() {
  if (!isHomePage()) return;
  if (overlayExists()) return;

  const contents = getContents();
  if (!contents) return;

  const overlay = createOverlay();
  contents.insertBefore(overlay, contents.firstChild);
}

// ─── Watch for SPA navigation & lazy DOM ──────────────────────────────────────

// YouTube is a SPA — watch URL changes
let lastPath = location.pathname;

const navObserver = new MutationObserver(() => {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    // Give YouTube time to render the new page's DOM
    setTimeout(injectOverlay, 800);
  }
});

navObserver.observe(document.body, { childList: true, subtree: true });

// Also watch for #contents appearing after initial page load
const domObserver = new MutationObserver((_, obs) => {
  if (isHomePage() && getContents()) {
    injectOverlay();
    obs.disconnect(); // Stop once injected; navObserver handles future navigations
  }
});

domObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// Immediate attempt (in case DOM is already ready)
setTimeout(injectOverlay, 600);
