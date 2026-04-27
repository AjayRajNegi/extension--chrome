const HEIGHT_KEY = "yt_blackscreen_height";
const DEFAULT_HEIGHT = 100;
const STEP = 100;
const MIN = 100;
const MAX = 5000;

const display = document.getElementById("height-val");
const btnInc = document.getElementById("btn-inc");
const btnDec = document.getElementById("btn-dec");

let currentHeight = DEFAULT_HEIGHT;

chrome.storage.sync.get({ [HEIGHT_KEY]: DEFAULT_HEIGHT }, (data) => {
  currentHeight = data[HEIGHT_KEY];
  render();
});

function render() {
  display.textContent = currentHeight;
  btnDec.disabled = currentHeight <= MIN;
  btnInc.disabled = currentHeight >= MAX;
}

function applyHeight(value) {
  currentHeight = value;
  render();
  chrome.storage.sync.set({ [HEIGHT_KEY]: currentHeight });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "SET_HEIGHT",
        value: currentHeight,
      });
    }
  });
}

btnInc.addEventListener("click", () => {
  if (currentHeight < MAX) applyHeight(currentHeight + STEP);
});
btnDec.addEventListener("click", () => {
  if (currentHeight > MIN) applyHeight(currentHeight - STEP);
});
