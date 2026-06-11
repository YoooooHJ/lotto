const chatMessagesEl = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");
const birthDateInput = document.getElementById("birthDate");

let chatHistory = [];
let isChatLoading = false;

function getBallColorClass(num) {
  if (num <= 10) return "yellow";
  if (num <= 20) return "blue";
  if (num <= 30) return "red";
  if (num <= 40) return "gray";
  return "green";
}

function createMiniBall(num, isBonus = false) {
  const ball = document.createElement("span");
  ball.className = `mini-ball ${getBallColorClass(num)}${isBonus ? " bonus-mini" : ""}`;
  ball.textContent = num;
  return ball;
}

function appendMessage(role, content, recommendation = null) {
  const item = document.createElement("div");
  item.className = `chat-message chat-message-${role}`;

  const label = document.createElement("span");
  label.className = "chat-message-label";
  label.textContent = role === "user" ? "?" : "?? ??";
  item.appendChild(label);

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.textContent = content;
  item.appendChild(bubble);

  if (recommendation) {
    const ballsWrap = document.createElement("div");
    ballsWrap.className = "chat-balls";

    recommendation.main.forEach((num) => {
      ballsWrap.appendChild(createMiniBall(num));
    });

    const plus = document.createElement("span");
    plus.className = "plus";
    plus.textContent = "+";
    ballsWrap.appendChild(plus);
    ballsWrap.appendChild(createMiniBall(recommendation.bonus, true));
    item.appendChild(ballsWrap);

    const applyBtn = document.createElement("button");
    applyBtn.type = "button";
    applyBtn.className = "btn btn-secondary chat-apply-btn";
    applyBtn.textContent = "?? ??? ??";
    applyBtn.addEventListener("click", () => {
      if (window.LottoApp?.applyRecommendedNumbers) {
        window.LottoApp.applyRecommendedNumbers(recommendation);
      }
    });
    item.appendChild(applyBtn);
  }

  chatMessagesEl.appendChild(item);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function setChatLoading(loading) {
  isChatLoading = loading;
  chatInput.disabled = loading;
  chatSendBtn.disabled = loading;
  chatSendBtn.textContent = loading ? "?? ?..." : "???";
}

function showWelcomeMessage() {
  appendMessage(
    "bot",
    "?????! ????? ??? ? ???? ???, ??? ??? ???? ?? ??? ?? ??? ??????."
  );
}

async function handleChatSubmit(event) {
  event.preventDefault();

  if (isChatLoading) return;

  const birthDate = birthDateInput.value;
  const message = chatInput.value.trim();

  if (!birthDate) {
    appendMessage("bot", "?? ????? ??? ???.");
    birthDateInput.focus();
    return;
  }

  if (!message) return;

  appendMessage("user", message);
  chatHistory.push({ role: "user", text: message });
  chatInput.value = "";
  setChatLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate,
        message,
        history: chatHistory.slice(-8),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "??? ??????.");
    }

    appendMessage("bot", data.reply, data.recommendation);
    chatHistory.push({ role: "bot", text: data.reply });
  } catch (error) {
    appendMessage("bot", error.message || "??? ??????. ?? ? ?? ??? ???.");
  } finally {
    setChatLoading(false);
    chatInput.focus();
  }
}

chatForm.addEventListener("submit", handleChatSubmit);
showWelcomeMessage();
