const STORAGE_KEY = "lottoSignedUp";
const SESSION_DISMISS_KEY = "lottoSignupDismissed";

const signupModal = document.getElementById("signupModal");
const signupForm = document.getElementById("signupForm");
const signupNameInput = document.getElementById("signupName");
const signupEmailInput = document.getElementById("signupEmail");
const signupSubmitBtn = document.getElementById("signupSubmitBtn");
const signupDismissBtn = document.getElementById("signupDismissBtn");
const signupMessage = document.getElementById("signupMessage");

function isSignedUp() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function isDismissedThisSession() {
  return sessionStorage.getItem(SESSION_DISMISS_KEY) === "true";
}

function openSignupModal() {
  if (isSignedUp() || isDismissedThisSession()) return;

  signupMessage.textContent = "";
  signupMessage.className = "signup-message";
  signupForm.hidden = false;
  signupModal.hidden = false;
  document.body.classList.add("modal-open");
  signupNameInput.focus();
}

function closeSignupModal() {
  signupModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function dismissSignupModal() {
  sessionStorage.setItem(SESSION_DISMISS_KEY, "true");
  closeSignupModal();
}

function setSubmitting(isSubmitting) {
  signupSubmitBtn.disabled = isSubmitting;
  signupNameInput.disabled = isSubmitting;
  signupEmailInput.disabled = isSubmitting;
  signupDismissBtn.disabled = isSubmitting;
  signupSubmitBtn.textContent = isSubmitting ? "?? ?..." : "????";
}

async function handleSignupSubmit(event) {
  event.preventDefault();

  const name = signupNameInput.value.trim();
  const email = signupEmailInput.value.trim();

  if (!name || !email) {
    signupMessage.textContent = "??? ???? ?? ??? ???.";
    signupMessage.className = "signup-message signup-message-error";
    return;
  }

  setSubmitting(true);
  signupMessage.textContent = "";

  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "??? ??????.");
    }

    localStorage.setItem(STORAGE_KEY, "true");
    signupMessage.textContent = data.message;
    signupMessage.className = "signup-message signup-message-success";
    signupForm.hidden = true;

    setTimeout(closeSignupModal, 1800);
  } catch (error) {
    signupMessage.textContent = error.message || "??? ??????. ?? ??? ???.";
    signupMessage.className = "signup-message signup-message-error";
  } finally {
    setSubmitting(false);
  }
}

signupForm.addEventListener("submit", handleSignupSubmit);
signupDismissBtn.addEventListener("click", dismissSignupModal);

signupModal.addEventListener("click", (event) => {
  if (event.target === signupModal) {
    dismissSignupModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !signupModal.hidden) {
    dismissSignupModal();
  }
});

window.SignupModal = {
  showAfterDraw: openSignupModal,
};
