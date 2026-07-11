const API_BASE = "https://www.googleapis.com/youtube/v3";
let API_KEY = localStorage.getItem("yt_api_key") || "";

const CATEGORIES = [
  { id: "0", label: "All" },
  { id: "10", label: "Music" },
  { id: "20", label: "Gaming" },
  { id: "17", label: "Sports" },
  { id: "25", label: "News" },
  { id: "24", label: "Entertainment" },
  { id: "28", label: "Science & Tech" },
  { id: "22", label: "Vlogs" },
  { id: "23", label: "Comedy" },
  { id: "27", label: "Education" },
];

let state = {
  view: "home", // home | search | watch
  category: "0",
  query: "",
  videoId: null,
};

// ---------- DOM refs ----------
const $ = (sel) => document.querySelector(sel);
const apiKeyModal = $("#apiKeyModal");
const apiKeyInput = $("#apiKeyInput");
const chipsEl = $("#chips");
const videoGrid = $("#videoGrid");
const loader = $("#loader");
const homeView = $("#homeView");
const watchView = $("#watchView");
const sidebar = $("#sidebar");

// ---------- Init ----------
function init() {
  buildChips();
  buildCategoryNav();
  bindEvents();
  if (!API_KEY) {
    apiKeyModal.style.display = "flex";
  } else {
    apiKeyModal.style.display = "none";
    loadHome();
  }
}

function bindEvents() {
  $("#apiKeySubmit").addEventListener("click", () => {
    const val = apiKeyInput.value.trim();
    if (!val) return;
    API_KEY = val;
    localStorage.setItem("yt_api_key", val);
    apiKeyModal.style.display = "none";
    loadHome();
  });
  apiKeyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("#apiKeySubmit").click();
  });

  $("#keyBtn").addEventListener("click", () => {
    apiKeyInput.value = API_KEY;
    apiKeyModal.style.display = "flex";
  });

  $("#menuBtn").addEventListener("click", () => sidebar.classList.toggle("open"));

  $("#logoBtn").addEventListener("click", (e) => {
    e.preventDefault();
    goHome();
  });

  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#searchInput").value.trim();
    if (!q) return;
    state.view = "search";
    state.query = q;
    showHomeView();
    searchVideos(q);
  });

  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".sidebar-link").forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      const v = link.dataset.view;
      if (v === "home") goHome();
      if (v === "trending") loadTrending();
    });
  });
}

function goHome() {
  state.view = "home";
  state.query = "";
  state.category = "0";
  $("#searchInput").value = "";
  updateChipActive();
  showHomeView();
  loadHome();
}

function showHomeView() {
  watchView.style.display = "none";
  homeView.style.display = "block";
}

// ---------- Chips (categories) ----------
function buildChips() {
  chipsEl.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (cat.id === state.category ? " active" : "");
    chip.textContent = cat.label;
    chip.dataset.id = cat.id;
    chip.addEventListener("click", () => {
      state.category = cat.id;
      state.view = "home";
      state.query = "";
      updateChipActive();
      showHomeView();
      loadHome();
    });
    chipsEl.appendChild(chip);
  });
}
function updateChipActive() {
  document.querySelectorAll(".chip").forEach((c) => {
    c.classList.toggle("active", c.dataset.id === state.category);
  });
}

function buildCategoryNav() {
  const nav = $("#categoryNav");
  const items = [
    { label: "Music", id: "10" },
    { label: "Gaming", id: "20" },
    { label: "News", id: "25" },
    { label: "Sports", id: "17" },
  ];
  nav.innerHTML = items
    .map(
      (i) =>
        `<a href="#" class="sidebar-link" data-cat="${i.id}"><svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="9"/></svg><span>${i.label}</span></a>`
    )
    .join("");
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      state.category = a.dataset.cat;
      state.view = "home";
      state.query = "";
      updateChipActive();
      showHomeView();
      loadHome();
    });
  });
}

// ---------- API helpers ----------
async function apiGet(path, params) {
  const url = new URL(`${API_BASE}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("key", API_KEY);
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }
  return res.json();
}

function fmtCount(n) {
  n = Number(n || 0);
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}
function fmtDate(iso) {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d) / 86400000);
  if (diffDays < 1) return "today";
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
}
function fmtDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = parseInt(m[1] || 0), min = parseInt(m[2] || 0), s = parseInt(m[3] || 0);
  const pad = (x) => String(x).padStart(2, "0");
  if (h) return `${h}:${pad(min)}:${pad(s)}`;
  return `${min}:${pad(s)}`;
}

// ---------- Loaders ----------
async function loadHome() {
  setLoading(true);
  videoGrid.innerHTML = "";
  try {
    const params = {
      part: "snippet,contentDetails,statistics",
      chart: "mostPopular",
      maxResults: 24,
      regionCode: "US",
    };
    if (state.category !== "0") params.videoCategoryId = state.category;
    const data = await apiGet("videos", params);
    renderGrid(data.items, true);
  } catch (e) {
    showError(e);
  } finally {
    setLoading(false);
  }
}

async function loadTrending() {
  state.view = "trending";
  state.category = "0";
  updateChipActive();
  showHomeView();
  loadHome();
}

async function searchVideos(query) {
  setLoading(true);
  videoGrid.innerHTML = "";
  try {
    const searchData = await apiGet("search", {
      part: "snippet",
      q: query,
      type: "video",
      maxResults: 24,
    });
    const ids = searchData.items.map((i) => i.id.videoId).join(",");
    if (!ids) {
      videoGrid.innerHTML = `<p style="color:var(--text-secondary)">No results found.</p>`;
      return;
    }
    const data = await apiGet("videos", {
      part: "snippet,contentDetails,statistics",
      id: ids,
    });
    renderGrid(data.items, true);
  } catch (e) {
    showError(e);
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  loader.style.display = isLoading ? "block" : "none";
}

function showError(e) {
  console.error(e);
  videoGrid.innerHTML = `<p style="color:var(--text-secondary);max-width:500px;">Something went wrong: ${escapeHtml(
    e.message
  )}. Double check your API key and that the YouTube Data API v3 is enabled for it in Google Cloud Console.</p>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Render ----------
function renderGrid(items, clickToWatch) {
  videoGrid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "video-card";
    const thumb = item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url;
    const duration = item.contentDetails ? fmtDuration(item.contentDetails.duration) : "";
    const views = item.statistics ? fmtCount(item.statistics.viewCount) : "";
    card.innerHTML = `
      <div class="thumb-wrap">
        <img src="${thumb}" alt="" loading="lazy">
        ${duration ? `<span class="duration-badge">${duration}</span>` : ""}
      </div>
      <div class="video-info">
        <div class="video-text">
          <p class="video-title">${escapeHtml(item.snippet.title)}</p>
          <p class="video-channel">${escapeHtml(item.snippet.channelTitle)}</p>
          <p class="video-stats">${views ? views + " views • " : ""}${fmtDate(item.snippet.publishedAt)}</p>
        </div>
      </div>
    `;
    if (clickToWatch) {
      card.addEventListener("click", () => watchVideo(item.id));
    }
    videoGrid.appendChild(card);
  });
}

// ---------- Watch view ----------
async function watchVideo(videoId) {
  state.view = "watch";
  state.videoId = videoId;
  homeView.style.display = "none";
  watchView.style.display = "flex";
  window.scrollTo(0, 0);

  $("#player").src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  $("#watchTitle").textContent = "Loading…";
  $("#relatedVideos").innerHTML = "";
  $("#descriptionBox").textContent = "";

  try {
    const data = await apiGet("videos", {
      part: "snippet,statistics",
      id: videoId,
    });
    const video = data.items[0];
    if (!video) return;
    $("#watchTitle").textContent = video.snippet.title;
    $("#watchStats").textContent = `${fmtCount(video.statistics.viewCount)} views`;
    $("#descriptionBox").textContent = video.snippet.description || "No description.";

    const channelData = await apiGet("channels", {
      part: "snippet,statistics",
      id: video.snippet.channelId,
    });
    const channel = channelData.items[0];
    if (channel) {
      $("#channelThumb").src = channel.snippet.thumbnails.default.url;
      $("#channelName").textContent = channel.snippet.title;
      $("#channelSubs").textContent = channel.statistics.hideSubscriberCount
        ? ""
        : `${fmtCount(channel.statistics.subscriberCount)} subscribers`;
    }

    loadRelated(video.snippet.title, video.snippet.channelId, videoId);
  } catch (e) {
    $("#watchTitle").textContent = "Error loading video";
    showError(e);
  }
}

async function loadRelated(title, channelId, excludeId) {
  const relatedEl = $("#relatedVideos");
  relatedEl.innerHTML = `<p style="color:var(--text-secondary);font-size:13px;">Loading related videos…</p>`;
  try {
    // The YouTube API no longer supports true "related videos", so we
    // approximate by searching on the video's title keywords.
    const searchData = await apiGet("search", {
      part: "snippet",
      q: title,
      type: "video",
      maxResults: 15,
    });
    const items = searchData.items.filter((i) => i.id.videoId !== excludeId);
    const ids = items.map((i) => i.id.videoId).join(",");
    if (!ids) {
      relatedEl.innerHTML = "";
      return;
    }
    const data = await apiGet("videos", {
      part: "snippet,contentDetails,statistics",
      id: ids,
    });
    relatedEl.innerHTML = "";
    data.items.forEach((item) => {
      const thumb = item.snippet.thumbnails.medium?.url;
      const card = document.createElement("div");
      card.className = "related-card";
      card.innerHTML = `
        <div class="thumb-wrap">
          <img src="${thumb}" alt="" loading="lazy">
          <span class="duration-badge">${fmtDuration(item.contentDetails.duration)}</span>
        </div>
        <div class="video-text">
          <p class="video-title">${escapeHtml(item.snippet.title)}</p>
          <p class="video-channel">${escapeHtml(item.snippet.channelTitle)}</p>
          <p class="video-stats">${fmtCount(item.statistics.viewCount)} views</p>
        </div>
      `;
      card.addEventListener("click", () => watchVideo(item.id));
      relatedEl.appendChild(card);
    });
  } catch (e) {
    relatedEl.innerHTML = "";
    console.error(e);
  }
}

init();
