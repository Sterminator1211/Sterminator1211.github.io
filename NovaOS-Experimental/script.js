// ==================== NOVAOS v1.4 - Vercel Blob Persistent Version ====================
let currentUser = "";
let currentDate = new Date();

const API_URL = "/api/users";

// ==================== API HELPER ====================
async function apiRequest(action, body = {}) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Server connection failed" };
  }
}

async function loadAllData() {
  try {
    const res = await fetch(API_URL);
    return await res.json();
  } catch {
    return { users: [] };
  }
}

// ==================== INITIAL LOAD ====================
window.onload = async () => {
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(fetchWeather, 180000);

  const savedTheme = localStorage.getItem("pref_theme");
  if (savedTheme === "light") {
    document.body.classList.remove("dark-mode");
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.checked = true;
  }
};

// ==================== AUTH ====================
async function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-msg");

  if (!username || !password) {
    errorMsg.textContent = "Please enter username and password";
    return;
  }

  const result = await apiRequest("login", { username, password });

  if (result.success && result.user) {
    currentUser = username;
    document.getElementById("user-display").innerText = `Logged in as: ${username}`;
    showView("home-page");
    loadUserData();
  } else {
    errorMsg.textContent = "Invalid username or password";
  }
}

async function handleSignUp() {
  const username = document.getElementById("new-username").value.trim();
  const password = document.getElementById("new-password").value;

  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }

  const result = await apiRequest("signup", { username, password });

  if (result.success) {
    alert("Account created successfully! Please log in.");
    showView("login-page");
  } else {
    alert(result.error || "Failed to create account");
  }
}

function handleLogout() {
  currentUser = "";
  showView("login-page");
}

// ==================== USER DATA ====================
async function loadUserData() {
  const data = await loadAllData();
  const user = data.users.find(u => u.username === currentUser);
  
  if (user && user.notes) {
    const notesInput = document.getElementById("notes-input");
    if (notesInput) notesInput.value = user.notes;
  }
}

async function saveNotes() {
  if (!currentUser) return alert("Please login first");
  
  const notes = document.getElementById("notes-input").value;
  const result = await apiRequest("save-notes", { username: currentUser, notes });
  
  if (result.success) {
    alert("Notes saved successfully!");
  } else {
    alert("Failed to save notes");
  }
}

// ==================== VIEW NAVIGATION ====================
function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "calendar-page") renderCalendar();
}

// ==================== CALENDAR ====================
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const monthYear = document.getElementById("current-month-year");
  grid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement("div");
    day.className = "calendar-day other-month";
    day.textContent = daysInPrevMonth - i;
    grid.appendChild(day);
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.textContent = day;

    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayEl.classList.add("today");
    }
    grid.appendChild(dayEl);
  }
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

// ==================== CALCULATOR ====================
let calcExpression = "";
function appendToDisplay(value) {
  calcExpression += value;
  document.getElementById("calc-display").value = calcExpression;
}
function clearCalc() {
  calcExpression = "";
  document.getElementById("calc-display").value = "";
}
function deleteLast() {
  calcExpression = calcExpression.slice(0, -1);
  document.getElementById("calc-display").value = calcExpression;
}
function calculate() {
  const display = document.getElementById("calc-display");
  try {
    let result = eval(calcExpression.replace("×", "*"));
    display.value = result;
    calcExpression = result.toString();
  } catch (e) {
    display.value = "Error";
    calcExpression = "";
  }
}

// ==================== TRANSLATE ====================
async function handleTranslate() {
  const inputText = document.getElementById("trans-input").value.trim();
  const sourceLang = document.getElementById("source-lang").value;
  const targetLang = document.getElementById("lang-select").value;
  const outputEl = document.getElementById("trans-output");

  if (!inputText) {
    outputEl.innerHTML = '<span style="color:red;">Please enter text to translate.</span>';
    return;
  }

  outputEl.innerText = "Translating...";

  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      body: JSON.stringify({
        q: inputText,
        source: sourceLang,
        target: targetLang,
        format: "text"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    outputEl.innerText = data.translatedText || "No translation available.";
  } catch (error) {
    outputEl.innerHTML = '<span style="color:red;">Translation failed. Service may be down.</span>';
  }
}

// ==================== WEATHER ====================
function fetchWeather() {
  const descEl = document.getElementById("weather-desc");
  const locEl = document.getElementById("weather-location");
  const tempEl = document.getElementById("weather-temp");

  if (!navigator.geolocation) {
    descEl.innerText = "Unsupported";
    locEl.innerText = "Browser limit";
    return;
  }

  descEl.innerText = "Requesting...";
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      locEl.innerText = "Fetching...";

      try {
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("API failed");

        const data = await res.json();
        const weather = data.current_weather;

        tempEl.innerText = Math.round(weather.temperature) + "°C";
        updateWeatherUI(weather.weathercode);
        locEl.innerText = "Local Weather";
      } catch (e) {
        descEl.innerText = "API Error";
        locEl.innerText = "Try again later";
      }
    },
    (err) => {
      descEl.innerText = "Location Denied";
      locEl.innerText = "Check permissions";
    }
  );
}

function updateWeatherUI(code) {
  const iconEl = document.getElementById("weather-icon");
  const descEl = document.getElementById("weather-desc");

  if (code === 0) {
    iconEl.innerText = "☀️";
    descEl.innerText = "Clear Sky";
  } else if (code <= 3) {
    iconEl.innerText = "⛅";
    descEl.innerText = "Partly Cloudy";
  } else if (code <= 48) {
    iconEl.innerText = "🌫️";
    descEl.innerText = "Foggy";
  } else if (code <= 67) {
    iconEl.innerText = "🌧️";
    descEl.innerText = "Rain";
  } else if (code <= 77) {
    iconEl.innerText = "❄️";
    descEl.innerText = "Snow";
  } else {
    iconEl.innerText = "⛈️";
    descEl.innerText = "Storm";
  }
}

// ==================== CLOCK ====================
function updateClock() {
  const now = new Date();
  const is12 = localStorage.getItem("pref_clock_12") === "true";
  const showSecs = localStorage.getItem("pref_show_seconds") !== "false";

  let options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: is12
  };
  if (showSecs) options.second = "2-digit";

  const timeString = now.toLocaleTimeString(is12 ? "en-US" : "en-GB", options);
  document.getElementById("clock-time").innerText = timeString;
  document.getElementById("clock-date").innerText = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

// ==================== SETTINGS ====================
function updateSystemColor(color) {
  document.documentElement.style.setProperty("--system-color", color);
}

function toggleSettingsMenu() {
  const menu = document.getElementById("settings-menu");
  menu.classList.toggle("hidden");
  if (!document.querySelector(".tab-pane:not(.hidden)")) {
    showSettingsTab("appearance");
  }
}

function showSettingsTab(tab) {
  const tabs = ["appearance", "wallpaper", "preferences", "privacy", "permissions"];
  tabs.forEach(t => {
    const el = document.getElementById("tab-" + t);
    if (el) el.classList.add("hidden");
  });
  const active = document.getElementById("tab-" + tab);
  if (active) active.classList.remove("hidden");
}

function toggleUnits() {
  const isImperial = document.getElementById("unit-toggle").checked;
  localStorage.setItem("pref_units", isImperial ? "imperial" : "metric");
  document.getElementById("unit-label").innerText = isImperial ? "Imperial (°F)" : "Metric (°C)";
  fetchWeather();
}

function toggleWeatherWidget() {
  const isVisible = document.getElementById("weather-toggle").checked;
  localStorage.setItem("pref_show_weather", isVisible);
  document.getElementById("weather-widget").style.display = isVisible ? "flex" : "none";
  if (isVisible) fetchWeather();
}

function updateClockSettings() {
  const is12 = document.getElementById("clock-format-toggle").checked;
  const showSecs = document.getElementById("clock-seconds-toggle").checked;
  localStorage.setItem("pref_clock_12", is12);
  localStorage.setItem("pref_show_seconds", showSecs);
  updateClock();
}

function toggleTheme() {
  const isLight = document.getElementById("theme-toggle").checked;
  document.body.classList.toggle("dark-mode", !isLight);
  localStorage.setItem("pref_theme", isLight ? "light" : "dark");
}

function setSolidColor(color) {
  const bg = document.getElementById("wallpaper-bg");
  bg.style.backgroundImage = "none";
  bg.style.backgroundColor = color;
  localStorage.setItem("pref_color", color);
  localStorage.removeItem("pref_img");
}

function uploadWallpaper(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("wallpaper-bg").style.backgroundImage = `url(${e.target.result})`;
      localStorage.setItem("pref_img", e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function changeWeatherPosition(position) {
  const widget = document.getElementById("weather-widget");
  localStorage.setItem("pref_weather_pos", position);

  widget.style.top = "";
  widget.style.bottom = "";
  widget.style.left = "";
  widget.style.right = "";

  switch (position) {
    case "top-left":
      widget.style.top = "30px"; widget.style.left = "30px";
      break;
    case "top-right":
      widget.style.top = "30px"; widget.style.right = "120px";
      break;
    case "bottom-right":
      widget.style.bottom = "30px"; widget.style.right = "120px";
      break;
    default:
      widget.style.bottom = "30px"; widget.style.left = "30px";
  }
}

function toggleIFrame() {
  const content = document.getElementById("main-content");
  let iframe = document.getElementById("web-iframe");

  if (iframe) iframe.remove();
  else {
    let url = prompt("Enter full URL (e.g. https://example.com):");
    if (url) {
      if (!url.startsWith("http")) url = "https://" + url;
      iframe = document.createElement("iframe");
      iframe.id = "web-iframe";
      iframe.src = url;
      content.appendChild(iframe);
    }
  }
}

console.log("NovaOS v1.4 - Vercel Blob Edition Loaded");
