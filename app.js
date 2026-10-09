
const talkBtn = document.getElementById("talkBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");
const statusDot = document.getElementById("statusDot");
const messageEl = document.getElementById("message");
const heardEl = document.getElementById("heard");
const replyEl = document.getElementById("reply");
const core = document.getElementById("core");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let listening = false;

function setStatus(text, active = false) {
  statusEl.textContent = text;
  statusDot.style.background = active ? "#00e5ff" : "#45f5a5";
  core.classList.toggle("active", active);
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    replyEl.textContent = text;
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onstart = () => setStatus("SPEAKING", true);
  utterance.onend = () => {
    if (!listening) setStatus("SYSTEM READY");
  };

  replyEl.textContent = text;
  messageEl.textContent = text;
  window.speechSynthesis.speak(utterance);
}

function respond(command) {
  const text = command.toLowerCase().trim();
  heardEl.textContent = command;

  if (/\b(hello|hi|hey)\b/.test(text)) {
    speak("Hello. JARVIS online. How can I help you?");
  } else if (text.includes("time")) {
    const now = new Date();
    speak("The current time is " +
      now.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit"
      }));
  } else if (text.includes("date") || text.includes("day")) {
    speak("Today is " +
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }));
  } else if (text.includes("who are you") ||
             text.includes("your name")) {
    speak("I am JARVIS, your personal web assistant.");
  } else if (text.includes("open youtube")) {
    speak("Opening YouTube.");
    window.location.href = "https://www.youtube.com/";
  } else if (text.includes("open google")) {
    speak("Opening Google.");
    window.location.href = "https://www.google.com/";
  } else if (text.includes("stop speaking") ||
             text === "stop") {
    window.speechSynthesis.cancel();
    speak("Speech stopped.");
  } else if (text.includes("help") ||
             text.includes("what can you do")) {
    speak("I can tell you the time and date, greet you, and open Google or YouTube.");
  } else {
    speak("I heard you say: " + command +
      ". This version supports basic commands only.");
  }
}

function startListening() {
  if (!SpeechRecognition) {
    setStatus("BROWSER UNSUPPORTED");
    messageEl.textContent =
      "Voice recognition is not supported by this browser. Try an updated Chrome browser.";
    return;
  }

  if (listening) return;

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listening = true;
      talkBtn.textContent = "🎙 LISTENING...";
      setStatus("LISTENING", true);
      messageEl.textContent = "I'm listening. Speak now.";
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      respond(transcript);
    };

    recognition.onerror = (event) => {
      const errors = {
        "not-allowed": "Microphone permission denied. Allow microphone access in site settings.",
        "service-not-allowed": "The browser's speech recognition service is blocked.",
        "no-speech": "No speech detected. Tap to talk and try again.",
        "network": "Speech recognition network service failed."
      };

      messageEl.textContent =
        errors[event.error] || "Voice error: " + event.error;
      setStatus("VOICE ERROR");
    };

    recognition.onend = () => {
      listening = false;
      talkBtn.textContent = "🎙 TAP TO TALK";
      if (!window.speechSynthesis.speaking) {
        setStatus("SYSTEM READY");
      }
    };
  }

  try {
    window.speechSynthesis.cancel();
    recognition.start();
  } catch (error) {
    messageEl.textContent =
      "Could not start the microphone. Please tap again.";
    setStatus("SYSTEM READY");
  }
}

talkBtn.addEventListener("click", startListening);

stopBtn.addEventListener("click", () => {
  if (recognition && listening) {
    recognition.stop();
  }

  window.speechSynthesis.cancel();
  listening = false;
  talkBtn.textContent = "🎙 TAP TO TALK";
  setStatus("SYSTEM READY");
  messageEl.textContent = "Ready for your next command.";
});

document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => {
    respond(button.dataset.command);
  });
});

if (!window.isSecureContext) {
  messageEl.textContent =
    "Use the HTTPS GitHub Pages website for microphone access.";
}

if (!SpeechRecognition) {
  messageEl.textContent =
    "Basic interface loaded. Voice recognition needs a supported browser.";
}

console.log("JARVIS Web Edition loaded.");