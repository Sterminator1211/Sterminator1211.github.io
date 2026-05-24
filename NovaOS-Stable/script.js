// ==================== NOVAOS - Main Script ====================
let users = JSON.parse(localStorage.getItem("user_db")) || [
  { username: "admin", password: "123" }
];
let currentUser = "";
let currentDate = new Date();

// ==================== INITIAL LOAD ====================
window.onload = () => {
  const savedColor = localStorage.getItem("pref_color");
  const savedImg = localStorage.getItem("pref_img");
  const savedTheme = localStorage.getItem("pref_theme");
  const savedSysColor = localStorage.getItem("pref_sys_color") || "#007bff";
  const savedUnits = localStorage.getItem("pref_units") || "metric";
  const showWeather = localStorage.getItem("pref_show_weather") !== "false";
  const savedClock12 = localStorage.getItem("pref_clock_12") === "true";
  const savedShowSeconds =
    localStorage.getItem("pref_show_seconds") !== "false";
  const savedWeatherPos =
    localStorage.getItem("pref_weather_pos") || "bottom-left";

  const bg = document.getElementById("wallpaper-bg");
  if (savedImg) bg.style.backgroundImage = `url(${savedImg})`;
  else if (savedColor) bg.style.backgroundColor = savedColor;

  if (savedTheme === "light") {
    document.body.classList.remove("dark-mode");
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) themeToggle.checked = true;
  }

  // Restore UI states
  const unitToggle = document.getElementById("unit-toggle");
  if (unitToggle) unitToggle.checked = savedUnits === "imperial";

  const unitLabel = document.getElementById("unit-label");
  if (unitLabel)
    unitLabel.innerText =
      savedUnits === "imperial" ? "Imperial (°F)" : "Metric (°C)";

  const weatherToggle = document.getElementById("weather-toggle");
  if (weatherToggle) weatherToggle.checked = showWeather;

  const weatherWidget = document.getElementById("weather-widget");
  if (weatherWidget)
    weatherWidget.style.display = showWeather ? "flex" : "none";

  const clock12Toggle = document.getElementById("clock-format-toggle");
  if (clock12Toggle) clock12Toggle.checked = savedClock12;

  const secondsToggle = document.getElementById("clock-seconds-toggle");
  if (secondsToggle) secondsToggle.checked = savedShowSeconds;

  // Restore Weather Position
  document.getElementById("weather-position").value = savedWeatherPos;
  changeWeatherPosition(savedWeatherPos);

  updateSystemColor(savedSysColor);
  const colorPicker = document.getElementById("system-color-picker");
  if (colorPicker) colorPicker.value = savedSysColor;

  loadPermStates();
  updateClock();

  setInterval(updateClock, 1000);
  setInterval(fetchWeather, 180000);
};

// ==================== WEATHER POSITION ====================
function changeWeatherPosition(position) {
  const widget = document.getElementById("weather-widget");
  localStorage.setItem("pref_weather_pos", position);

  // Reset all positions first
  widget.style.top = "";
  widget.style.bottom = "";
  widget.style.left = "";
  widget.style.right = "";

  switch (position) {
    case "top-left":
      widget.style.top = "30px";
      widget.style.left = "30px";
      widget.style.bottom = "auto";
      widget.style.right = "auto";
      break;
    case "top-right":
      widget.style.top = "30px";
      widget.style.right = "120px"; // Avoid overlapping sidebar
      widget.style.bottom = "auto";
      widget.style.left = "auto";
      break;
    case "bottom-right":
      widget.style.bottom = "30px";
      widget.style.right = "120px"; // Avoid overlapping sidebar
      widget.style.top = "auto";
      widget.style.left = "auto";
      break;
    case "bottom-left":
    default:
      widget.style.bottom = "30px";
      widget.style.left = "30px";
      widget.style.top = "auto";
      widget.style.right = "auto";
      break;
  }
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

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
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

// ==================== TRANSLATOR ====================
async function handleTranslate() {
  const inputText = document.getElementById("trans-input").value.trim();
  const sourceLang = document.getElementById("source-lang").value;
  const targetLang = document.getElementById("lang-select").value;
  const outputEl = document.getElementById("trans-output");

  if (!inputText) {
    outputEl.innerHTML =
      '<span style="color:red;">Please enter text to translate.</span>';
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

    if (!res.ok) throw new Error("Service error");

    const data = await res.json();
    outputEl.innerText = data.translatedText || "No translation available.";
  } catch (error) {
    console.error(error);
    outputEl.innerHTML =
      '<span style="color:red;">Translation failed. Service may be down.</span>';
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
        const unitPref = localStorage.getItem("pref_units") || "metric";

        let displayTemp = weather.temperature;
        let symbol = "°C";
        if (unitPref === "imperial") {
          displayTemp = (displayTemp * 9) / 5 + 32;
          symbol = "°F";
        }

        tempEl.innerText = Math.round(displayTemp) + symbol;
        updateWeatherUI(weather.weathercode);
        locEl.innerText = "Local Weather";
      } catch (e) {
        console.error(e);
        descEl.innerText = "API Error";
        locEl.innerText = "Try again later";
      }
    },
    (err) => {
      descEl.innerText = "Location Denied";
      locEl.innerText = "Check permissions";
    },
    { timeout: 10000 }
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

// ==================== SETTINGS & PREFERENCES ====================
function updateSystemColor(color) {
  document.documentElement.style.setProperty("--system-color", color);
  localStorage.setItem("pref_sys_color", color);
}

function toggleSettingsMenu() {
  const menu = document.getElementById("settings-menu");
  menu.classList.toggle("hidden");

  if (!document.querySelector(".tab-pane:not(.hidden)")) {
    showSettingsTab("appearance");
  }
}

function showSettingsTab(tab) {
  const tabs = [
    "appearance",
    "wallpaper",
    "preferences",
    "privacy",
    "permissions"
  ];
  tabs.forEach((t) => {
    const el = document.getElementById("tab-" + t);
    if (el) el.classList.add("hidden");
  });
  const active = document.getElementById("tab-" + tab);
  if (active) active.classList.remove("hidden");
}

function toggleUnits() {
  const isImperial = document.getElementById("unit-toggle").checked;
  localStorage.setItem("pref_units", isImperial ? "imperial" : "metric");
  document.getElementById("unit-label").innerText = isImperial
    ? "Imperial (°F)"
    : "Metric (°C)";
  fetchWeather();
}

function toggleWeatherWidget() {
  const isVisible = document.getElementById("weather-toggle").checked;
  localStorage.setItem("pref_show_weather", isVisible);
  document.getElementById("weather-widget").style.display = isVisible
    ? "flex"
    : "none";
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
      document.getElementById(
        "wallpaper-bg"
      ).style.backgroundImage = `url(${e.target.result})`;
      localStorage.setItem("pref_img", e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// ==================== AUTH & NAVIGATION ====================
function handleLogin() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value;
  const match = users.find(
    (user) => user.username === u && user.password === p
  );

  if (match) {
    currentUser = u;
    document.getElementById("user-display").innerText = "Logged in as: " + u;
    showView("home-page");
    if (localStorage.getItem("pref_show_weather") !== "false") fetchWeather();
  } else {
    document.getElementById("error-msg").innerText =
      "Invalid username or password";
  }
}

function handleSignUp() {
  const u = document.getElementById("new-username").value.trim();
  const p = document.getElementById("new-password").value;

  if (u && p) {
    if (users.some((user) => user.username === u)) {
      alert("Username already exists!");
      return;
    }
    users.push({ username: u, password: p });
    localStorage.setItem("user_db", JSON.stringify(users));
    alert("Account Created Successfully!");
    showView("login-page");
  } else {
    alert("Please fill all fields");
  }
}

function handleLogout() {
  currentUser = "";
  const frame = document.getElementById("web-iframe");
  if (frame) frame.remove();
  showView("login-page");
}

function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "calendar-page") renderCalendar();
  if (id === "notes-page" && currentUser) {
    document.getElementById("notes-input").value =
      localStorage.getItem("notes_" + currentUser) || "";
  }
}

function saveNotes() {
  if (currentUser) {
    localStorage.setItem(
      "notes_" + currentUser,
      document.getElementById("notes-input").value
    );
    alert("Notes Saved!");
  }
}

// ==================== IFRAME ====================
function toggleIFrame() {
  const content = document.getElementById("main-content");
  let iframe = document.getElementById("web-iframe");

  if (iframe) {
    iframe.remove();
  } else {
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

// ==================== PERMISSIONS ====================
async function requestBrowserPerm(apiName, shortName) {
  const toggle = document.getElementById("perm-" + shortName);
  let granted = false;

  try {
    if (apiName === "geolocation") {
      await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );
      granted = true;
    } else if (apiName === "notifications") {
      granted = (await Notification.requestPermission()) === "granted";
    } else if (apiName === "microphone" || apiName === "camera") {
      await navigator.mediaDevices.getUserMedia({
        audio: apiName === "microphone",
        video: apiName === "camera"
      });
      granted = true;
    }
  } catch (e) {
    granted = false;
  }

  toggle.checked = granted;

  if (granted) {
    let perms = JSON.parse(localStorage.getItem("saved_permissions")) || [];
    if (!perms.includes(apiName)) {
      perms.push(apiName);
      localStorage.setItem("saved_permissions", JSON.stringify(perms));
    }
  }
}

function loadPermStates() {
  let perms = JSON.parse(localStorage.getItem("saved_permissions")) || [];
  const map = {
    geolocation: "geo",
    notifications: "notify",
    microphone: "mic",
    camera: "cam"
  };
  perms.forEach((p) => {
    if (map[p]) {
      const el = document.getElementById("perm-" + map[p]);
      if (el) el.checked = true;
    }
  });
}

function resetAllPermissions() {
  localStorage.removeItem("saved_permissions");
  ["geo", "notify", "mic", "cam"].forEach((id) => {
    const el = document.getElementById("perm-" + id);
    if (el) el.checked = false;
  });
  alert("All permissions have been reset.");
}
