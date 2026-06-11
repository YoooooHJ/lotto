const MIN_NUMBER = 1;
const MAX_NUMBER = 45;
const MAIN_COUNT = 6;

const mainBallsEl = document.getElementById("mainBalls");
const bonusBallsEl = document.getElementById("bonusBalls");
const drawBtn = document.getElementById("drawBtn");
const resetBtn = document.getElementById("resetBtn");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");

let isDrawing = false;
let history = [];

function getBallColorClass(num) {
  if (num <= 10) return "yellow";
  if (num <= 20) return "blue";
  if (num <= 30) return "red";
  if (num <= 40) return "gray";
  return "green";
}

function pickUniqueNumbers(count, exclude = []) {
  const pool = [];
  for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
    if (!exclude.includes(i)) pool.push(i);
  }

  const picked = [];
  while (picked.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.sort((a, b) => a - b);
}

function drawLotto() {
  const main = pickUniqueNumbers(MAIN_COUNT);
  const bonus = pickUniqueNumbers(1, main)[0];
  return { main, bonus };
}

function createBallElement(num, isBonus = false) {
  const ball = document.createElement("div");
  ball.className = `ball ${getBallColorClass(num)}${isBonus ? " bonus" : ""}`;
  ball.textContent = num;
  return ball;
}

function resetBalls(container, count, isBonus = false) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const ball = document.createElement("div");
    ball.className = `ball placeholder${isBonus ? " bonus" : ""}`;
    ball.dataset.index = i;
    ball.textContent = "?";
    container.appendChild(ball);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function revealNumbers(result) {
  const mainBallEls = mainBallsEl.querySelectorAll(".ball");

  for (let i = 0; i < result.main.length; i++) {
    await delay(350);
    const newBall = createBallElement(result.main[i]);
    newBall.classList.add("revealing");
    mainBallEls[i].replaceWith(newBall);
  }

  await delay(500);

  const bonusBallEl = bonusBallsEl.querySelector(".ball");
  const newBonus = createBallElement(result.bonus, true);
  newBonus.classList.add("revealing");
  bonusBallEl.replaceWith(newBonus);
}

function addToHistory(result) {
  history.unshift(result);
  if (history.length > 10) history.pop();

  historySection.hidden = false;
  historyList.innerHTML = "";

  history.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "history-item";

    entry.main.forEach((num) => {
      const mini = document.createElement("span");
      mini.className = `mini-ball ${getBallColorClass(num)}`;
      mini.textContent = num;
      li.appendChild(mini);
    });

    const plus = document.createElement("span");
    plus.className = "plus";
    plus.textContent = "+";
    li.appendChild(plus);

    const bonusMini = document.createElement("span");
    bonusMini.className = `mini-ball bonus-mini ${getBallColorClass(entry.bonus)}`;
    bonusMini.textContent = entry.bonus;
    li.appendChild(bonusMini);

    historyList.appendChild(li);
  });
}

async function handleDraw() {
  if (isDrawing) return;
  isDrawing = true;
  drawBtn.disabled = true;
  drawBtn.classList.add("drawing");
  resetBtn.disabled = true;

  resetBalls(mainBallsEl, MAIN_COUNT);
  resetBalls(bonusBallsEl, 1, true);

  const result = drawLotto();
  await revealNumbers(result);
  addToHistory(result);

  isDrawing = false;
  drawBtn.disabled = false;
  drawBtn.classList.remove("drawing");
  resetBtn.disabled = false;

  setTimeout(() => {
    window.SignupModal?.showAfterDraw();
  }, 400);
}

function handleReset() {
  if (isDrawing) return;
  resetBalls(mainBallsEl, MAIN_COUNT);
  resetBalls(bonusBallsEl, 1, true);
  history = [];
  historyList.innerHTML = "";
  historySection.hidden = true;
  resetBtn.disabled = true;
}

async function applyRecommendedNumbers(result) {
  if (isDrawing || !result?.main?.length) return;
  isDrawing = true;
  drawBtn.disabled = true;
  resetBtn.disabled = true;

  resetBalls(mainBallsEl, MAIN_COUNT);
  resetBalls(bonusBallsEl, 1, true);
  await revealNumbers(result);
  addToHistory(result);

  isDrawing = false;
  drawBtn.disabled = false;
  resetBtn.disabled = false;

  setTimeout(() => {
    window.SignupModal?.showAfterDraw();
  }, 400);
}

window.LottoApp = { applyRecommendedNumbers };

drawBtn.addEventListener("click", handleDraw);
resetBtn.addEventListener("click", handleReset);
