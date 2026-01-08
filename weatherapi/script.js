const API_KEY = "60dcc472314d360166b37f1fa47725a3";

/* ===== ELEMENTS ===== */
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherDiv = document.getElementById("weather");
const errorEl = document.getElementById("error");
const loader = document.getElementById("loader");
const forecastEl = document.getElementById("forecast");

const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const humidityEl = document.getElementById("humidity");
const iconEl = document.getElementById("icon");

/* ===== EVENTS ===== */
searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") handleSearch();
});

/* ===== HANDLERS ===== */
function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name");
    return;
  }
  fetchWeather(city);
  fetchForecast(city);
}

/* ===== WEATHER ===== */
async function fetchWeather(city) {
  showLoader();

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    renderWeather(data);
    setWeatherBackground(data.weather[0].main.toLowerCase());
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoader();
  }
}

function renderWeather(data) {
  errorEl.textContent = "";
  weatherDiv.classList.remove("hidden");

  cityEl.textContent = `${data.name}, ${data.sys.country}`;
  tempEl.textContent = `🌡 ${Math.round(data.main.temp)} °C`;
  conditionEl.textContent = data.weather[0].description;
  humidityEl.textContent = `💧 ${data.main.humidity}%`;

  iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

/* ===== FORECAST ===== */
async function fetchForecast(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await res.json();

    if (!res.ok) throw new Error("Forecast unavailable");

    renderForecast(data.list);
  } catch (err) {
    console.error(err.message);
  }
}

function renderForecast(list) {
  forecastEl.innerHTML = "";

  const daily = {};
  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = item;
  });

  Object.values(daily).slice(0, 4).forEach(day => {
    const card = document.createElement("div");
    card.className = "forecast-card";

    card.innerHTML = `
      <h4>${new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: "short" })}</h4>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" />
      <p>${Math.round(day.main.temp)} °C</p>
    `;

    forecastEl.appendChild(card);
  });
}

/* ===== UI HELPERS ===== */
function showError(msg) {
  weatherDiv.classList.add("hidden");
  errorEl.textContent = msg;
}

function showLoader() {
  loader.classList.remove("hidden");
  errorEl.textContent = "";
  weatherDiv.classList.add("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

/* ===== BACKGROUND ===== */
function setWeatherBackground(weather) {
  const body = document.getElementById("app");

  if (weather.includes("rain")) body.className = "rain";
  else if (weather.includes("cloud")) body.className = "cloudy";
  else if (weather.includes("snow")) body.className = "snow";
  else body.className = "sunny";
}
